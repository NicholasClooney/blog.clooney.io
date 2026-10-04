---
title: "DNS 是无辜的：沿着 TLS、VPN 和手机热点追查 Parsec 故障"
date: 2026-03-22
tags:
  - networking
  - tls
  - dns
  - macos
  - vpn
  - debugging
excerpt: |
  Parsec 故障起初看似 DNS 问题，真正原因却是某条网络路径上针对特定主机名的 TLS 失败。本文记录从误导性症状到通过热点相关排查找出真相的过程。
---

那是伦敦一个美好的星期天早晨。我带着 MacBook Air 出门晒太阳，打算通过 Parsec 远程连接家里的 MacBook Pro，写一点代码。没想到，它用不了了。

[[toc]]

## 从错误的怀疑对象开始

一个熟悉的嫌疑立刻浮现在脑海里。我以为又遇到了之前记录在[那篇关于 macOS 浏览器解析器状态的文章](/zh/posts/macos-browsers-cant-load-websites-dns-resolver-state/)中的 Tailscale DNS 问题。但继续深入后，才发现完全不是一回事，老实说，结果还更让人意外。

这个奇怪的网络故障，带着一个极有迷惑性的假线索。

Parsec 无法正常启动，官网打不开，`brew reinstall --cask parsec` 也失败了。乍看就是典型的 DNS 问题：主机名有时似乎不可达，故障又有选择性，很像解析器出了怪事。但深入调查得到的是另一个故事：DNS 没问题。真正的故障发生在更后面的 TLS 阶段，而且只出现在一条网络路径上。

这篇文章会走一遍调查过程，解释各个信号意味着什么，以及为什么 VPN 能暂时“修好”问题。

## 症状

同一台机器上，三件事同时坏了：

- Parsec 应用无法正常启动
- `https://parsec.app` 无法加载
- `brew reinstall --cask parsec` 下载软件包失败

与此同时，基础连接看起来仍然正常：

- DNS 查询似乎有效
- `ping` 正常
- 普通互联网访问正常

这种组合正是这类问题烦人的原因。像 DNS，又不完全像；像整体连通性问题，又不完全像。

## 第一轮：排除明显原因

首先检查常见的本地嫌疑：

- 没有设置 shell 代理变量
- macOS 代理设置为空
- `/etc/hosts` 中没有可疑内容
- Homebrew 本身正常
- 没有发现针对 `parsec.app` 的本地覆盖设置

然后是关键测试：

```bash
curl -I -v --connect-timeout 10 https://parsec.app
```

结果给出了第一个重要线索。失败并不发生在名称解析阶段：它成功解析 `parsec.app`，向 `443` 端口建立 TCP 连接，发送 TLS ClientHello，然后连接被重置。

这与 DNS 出错属于完全不同的一类故障。

换句话说：

- DNS 解析成功
- 到服务器的路由成功
- TCP 连接成功
- 断点出现在 TLS 握手阶段

调查方向立刻从“过期的解析器缓存”，转向了“路径上有某个东西不喜欢这个主机名”。

## Homebrew 真正告诉了我们什么

Homebrew 重装失败也提供了线索。

`brew reinstall --cask parsec` 最终在尝试从下面地址获取 Parsec 时失败：

```text
https://builds.parsec.app/package/parsec-macos.pkg
```

直接测试该地址，模式相同：DNS 正常，TCP 已连接，TLS 被重置。

这就不再只是“应用坏了”或“网站坏了”。多个 Parsec HTTPS 端点以相同方式失败。

范围由此缩小为：专门影响 Parsec 域名的网络路径问题。

## 改变一切的对照测试

此时最有力的假设，是 TLS 层按主机名进行阻断，通常由 SNI 触发。

为了验证，我使用两个不同的主机名连接同一个 Cloudflare IP。

首先是 Parsec：

```bash
openssl s_client -connect 104.18.1.181:443 -servername parsec.app -brief
```

连接立即被重置，测试失败。

然后使用同一个 IP，不同的 SNI：

```bash
openssl s_client -connect 104.18.1.181:443 -servername www.cloudflare.com -brief
```

这次成功完成。

这是决定性的结果。

同一个边缘 IP 可以顺利为 `www.cloudflare.com` 完成 TLS，却在请求主机名为 `parsec.app` 时重置连接。这意味着问题不是服务器的基础可达性，也不是 Cloudflare 整体故障，更不是解析器问题。区别在于 TLS 阶段提交的主机名。

这是强烈的信号：网络路径上的某处在针对特定主机名进行过滤或拒绝。

## Apple 网络栈也确认了这一点

为了确认不是 curl/OpenSSL 的特殊行为，我也通过 Apple 自己的网络栈测试了同一个网站：

```bash
nscurl --verbose https://parsec.app
```

同样出现 SSL 失败。因此，这既不是 Homebrew 的问题，也不是 curl 库的问题。macOS 原生网络栈遇到了同样的安全连接故障。

## 为什么 VPN 成了突破口

随后出现了令人意外的现象。

开启 ProtonVPN 后，Parsec 正常了。网站能加载，应用能工作，下载也能完成。

关闭 ProtonVPN，问题就回来。

这一个开关，改变了对整个事件的理解。

如果 VPN 能让网站恢复，通常意味着：

- 目标服务正常
- 本地机器具备连接能力
- 变量在于通常使用的网络路径

VPN 会同时改变路由和外界看到的公网 IP。根据过滤发生的位置，它还可能向中间网络设备隐藏原始目的地。因此，如果 Parsec 在 VPN 隧道内正常，隧道外失败，最可能的解释就是普通网络路径干扰了这些流量。

此时，DNS 作为根因的可能性更低了。刷新 DNS 缓存无法解释，为什么把流量封装进 VPN 就能让问题消失。

## 关键的环境细节

这台机器没有连接普通家庭宽带，而是通过手机热点上网。

这一点非常重要。

活动接口显示的是 `172.20.10.x` 网段的私有地址，macOS 连接 iPhone 个人热点时通常会获得这样的地址。明确这一点后，最可能的嫌疑就转向移动运营商网络路径本身。

当前假设变成了：

- 在热点路径上，发往 `parsec.app` 的流量因主机名／SNI，在 TLS 期间被重置
- 在 ProtonVPN 内，这个主机名对热点／运营商路径不可见，因此连接正常

这与所有观察到的现象吻合。

## 为什么不是 DNS

症状很容易误导人，所以有必要说清楚。

它不是 DNS 问题，因为：

- `parsec.app` 正确解析
- `/etc/hosts` 没有错误条目
- TCP 到达了正确服务器的 `443` 端口
- 失败发生在连接建立后、TLS 期间
- 同一个主机通过 VPN 就能访问，无需修改本地 DNS
- 同一个边缘 IP 使用另一个主机名时成功

损坏的 DNS 缓存通常会把你带到错误位置、导致解析失败，或间歇返回错误记录。它不会稳定地允许 TCP 连接，然后再触发针对 SNI 的 TLS 重置。

## 最可能的根因

证据指向手机热点或运营商网络路径上针对特定主机名的过滤。

这种过滤可能来自：

- 有意实施的策略
- 运营商侧流量检查的误判
- 某个中间设备的临时问题
- 某条路径与 Cloudflare、Parsec 主机名之间的特定交互

没有运营商网络的内部可见性，我无法证明到底是哪一种。但本地证据已经足够明确，可以确定故障发生在哪一层。

## 最有用的两组诊断命令

如果想快速区分“DNS 问题”和“TLS/SNI 问题”，这两组检查非常好用：

```bash
curl -I -v --connect-timeout 10 https://parsec.app
```

如果看到解析成功、TCP 连接成功，随后在 TLS 期间被重置，DNS 就不是主要问题。

接着运行：

```bash
openssl s_client -connect 104.18.1.181:443 -servername parsec.app -brief
openssl s_client -connect 104.18.1.181:443 -servername www.cloudflare.com -brief
```

如果同一个 IP 上，第一条失败、第二条成功，就说明网络路径在 TLS 期间对不同主机名采取了不同处理。

这是一个很强的信号。

## 实际结果

实际解决办法很直接：

- 用 ProtonVPN 暂时绕过
- 换一个网络
- 把手机热点／运营商路径视为最可能的干扰来源

看似 DNS 的问题，最终带来了一堂更清晰、也更有趣的网络课：解析、路由、TCP 和 TLS 是彼此独立的步骤，其中一步成功，并不能说明其他步骤也正常。

这次，DNS 是无辜的。真正的问题藏在“已连接到 443 端口”和“安全连接已建立”之间。
