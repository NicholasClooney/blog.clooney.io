---
title: "一份不算短的 Tailscale 入门指南：让安全联网变简单"
date: 2025-10-01
tags:
  - tailscale
  - networking
  - private-network
  - security
  - infra
  - devops
---

过去几周，我花了不少时间试用 **Tailscale**，它很快成了我最喜欢的工具之一。

如果你还没听说过，[Tailscale](https://tailscale.com/) 是一款基于 WireGuard、安全又易用的网状 VPN。无论设备在世界哪里，它都能让它们像处于同一个局域网一样相互通信。

之前我在博文中写过更完整的 Tailscale 探索过程，比如[《随时随地用 iPhone 写代码》](/zh/posts/ssh-from-iPhone-to-Mac/)和[《深入网络调试》](/zh/posts/networking-deep-dive)。这次想聚焦更具体的内容：一份**入门指南**，穿插几个我自己的**实际用例**，从帮助中国的家人联网，到让自己的服务保持私密。

开始之前说明一下：这里的概念并不复杂，但前后有关联。我会边讲边解释关键概念。

---

[[toc]]

## 为什么用 Tailscale？

对大多数人来说，VPN 要么是上班登录的笨重企业工具，要么是承诺“隐私”、却把所有流量经过别人服务器的消费级应用。两者都像黑箱，你并不清楚幕后发生了什么。

Tailscale **不一样**。它给你一张自己的安全私有网络，以及**完整控制权**。装上应用，用 Google、Apple、GitHub 等账户登录，你的所有设备就突然能看见彼此，像摆在一起一样。

### 它实际如何工作，简短版

底层使用的是 [WireGuard](https://www.wireguard.com/)，一种现代、精简的 VPN 协议，以速度快、密码学设计扎实著称。但单独使用 WireGuard，需要为每对设备手动交换密钥和配置。Tailscale 通过**控制平面**自动处理这些事；控制平面是负责密钥分发和节点发现的协调服务器。

结果是一张**网状网络**。流量不必像传统中心辐射式 VPN 那样全部经过中央服务器，设备可以**直接点对点连接**。这样延迟更低，流量会尽可能走最直接的路径。

无法直连时，比如两端都位于严格 NAT 后面，Tailscale 会回退到 [DERP](https://pkg.go.dev/tailscale.com/derp) 服务器中继。你不会察觉区别，它就是能用。

每个设备都会由 Tailscale 分配一个稳定的 **100.x.x.x** 地址，来自 CGNAT 地址段。这些地址不会变化，所以即使笔记本换了网络，Tailscale IP 仍保持不变。

我喜欢它的原因有：

* **配置简单**：无需端口转发、防火墙规则或静态 IP。
* **内置安全性**：WireGuard 的密码学机制，加上关联登录服务商的身份认证。
* **跨平台**：支持 macOS、iOS、Linux、Windows、Android，甚至路由器和 Raspberry Pi。
* **像同一个网络**：默认启用 MagicDNS，可以通过设备名连接，不用记 IP。`ssh macbook-pro` 直接就能用。

更强大的地方在于：

* 可以从世界任何地方访问笔记本，就像连着同一个 Wi-Fi。
* 可以设置**出口节点**，让所有互联网流量通过另一台设备，适合绕过防火墙、避开地域限制，或像在家一样上网。
* 可以安全运行私有服务，而不把它们暴露到公网。

---

## 开始使用

初次使用 Tailscale，最快的入门方式是：

1. 用喜欢的登录方式在 [tailscale.com](https://tailscale.com/) **注册**，例如 Google、Apple、GitHub、Microsoft。
2. 在笔记本、手机、服务器等设备上**安装 Tailscale**。
3. **在每台设备上登录**，它们就会出现在你的个人 **tailnet** 中，这是 Tailscale 对私有网络的称呼。
4. **试一试**：用主机名 SSH 到另一台机器，或通过 Tailscale IP 打开一个私有服务。

就这些。没有防火墙规则，没有公网 IP 的烦恼，只有设备之间直接、安全的通信。

### macOS 或 Linux 上

在 macOS 上，Tailscale 是菜单栏应用。安装后点击它，就能看到所有已连接设备及其 Tailscale IP。

在 Linux 服务器或无界面的 Raspberry Pi 上，命令行很好用：

```bash
# Install on Debian/Ubuntu
curl -fsSL https://tailscale.com/install.sh | sh

# Start the Tailscale daemon
sudo tailscaled

# Bring it up and authenticate
sudo tailscale up

# Check status and see all peers
tailscale status
```

执行 `tailscale up` 后，会出现一个 URL，在浏览器打开它完成认证。完成后，这台设备就是 tailnet 的一员了。

### Tailscale 管理控制台

[管理控制台](https://login.tailscale.com/admin/machines) 用于管理所有内容：

* **Machines**：查看所有设备、IP、操作系统和最后在线时间。
* **DNS**：配置 MagicDNS 和自定义域名服务器。
* **ACLs**：控制哪些设备可以互相通信，后面会介绍。
* **Exit nodes**：批准设备作为互联网网关。

界面出乎意料地清爽。早些熟悉它，会让后面的高级功能更容易上手。

---

## Tailscale 的实际用例

### 帮家人跨越防火长城

对我来说，最有意义的用途之一是给中国的家人配置 Tailscale。防火长城让许多 VPN 方案不可靠，或者配置过于技术化。Tailscale 的方式不同：连接是点对点的，流量看起来像标准 WireGuard UDP，因此比很多替代方案更有韧性。

他们的设置过程很简单：装应用，登录我创建的共享账户，就进入我的 tailnet 了。然后我把家里的 Mac 设为**出口节点**。他们启用这个节点后，所有互联网流量就会经过我的机器，再从家里的网络出去。

在 Linux 上配置出口节点：

```bash
sudo tailscale up --advertise-exit-node
```

然后在管理控制台的机器设置中批准这个出口节点。他们那边只需在 Tailscale 应用里选中它，不需要终端。

我特别喜欢他们意识到这有多**简单**、多**强大**的那一刻：只花**这么一点功夫**，就能访问自由开放的互联网。这种体验值得努力实现。

### 自己的私有远程终端，不暴露 SSH

Tailscale 也支撑着我的工作流。无论在 MacBook Air 和 MacBook Pro 之间切换，还是连接 Linux 服务器，它都是我的**安全远程终端方案**。即使人在地球另一边，用起来也像局域网 SSH。

关键是：**我完全不把 SSH 的 22 端口暴露到互联网。** 服务器防火墙阻止所有来自公网的入站连接，SSH 只通过 Tailscale 接口工作。

```bash
# SSH by hostname, not IP - MagicDNS resolves it
ssh debian-server

# Or use Tailscale SSH, which handles auth too
tailscale ssh debian-server
```

[Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) 值得单独说说。它与通过 Tailscale 连接运行普通 SSH，是完全不同的机制。它不是让你运行系统 SSH 守护进程、再通过 Tailscale 网络连接，而是直接替代 SSH 服务器。认证由 Tailscale 根据设备身份处理。无需生成密钥，也不用管理 `authorized_keys`。

在服务器端启用时，启动 Tailscale 带上 `--ssh`：

```bash
sudo tailscale up --ssh
```

就这么简单。从 tailnet 中的其他设备执行 `tailscale ssh debian-server`，就能直接连接，由 Tailscale 身份完成认证。对于没费心配置传统密钥的机器，我常用它快速访问，少管理一件事。

### 安全访问自己的服务

我运行着几个私有服务：MacBook Pro 上的博客预览版本、VPS 上的统计仪表盘，以及一些内部工具。我不把它们暴露到公网，而是放在 Tailscale 后面限制访问。

实际做法是：服务监听 `0.0.0.0`，或专门监听 Tailscale 接口，但机器防火墙只允许来自 Tailscale CGNAT 地址段（`100.64.0.0/10`）的入站连接。公网无法访问。

```bash
# Example: lock a service to Tailscale only with ufw
sudo ufw allow in on tailscale0
sudo ufw deny 3000  # deny the port publicly
```

这样，只有我或我明确加入 tailnet 的人才能访问。这是我找到的最简洁的个人服务运行方式，不用管理证书、nginx 认证代理或 IP 白名单。

---

## 技巧与扩展功能

熟悉基础之后，还有一些很值得探索的功能：

### 子网路由器

出口节点把*所有*流量经由另一台设备转发。**子网路由器**则更精准：它向 tailnet 通告一个特定局域网地址段，让其他设备能访问该子网中的机器，无需每台都装 Tailscale。

这很适合家庭实验室。如果路由器或 Raspberry Pi 运行 Tailscale，并通告 `192.168.1.0/24`，你就能从任何地方 SSH 到这个局域网内的设备，即使那些设备没装 Tailscale。

```bash
sudo tailscale up --advertise-routes=192.168.1.0/24
```

在管理控制台批准它，并在设备上启用 IP 转发，就完成了。

### ACL，访问控制列表

默认情况下，tailnet 中所有设备都能互相访问。个人使用没问题，但开始与别人共享访问权限时，ACL 能精确规定谁能连接什么。

策略在管理控制台中用类似 JSON 的简单格式编写。例如，你可以规定“只有我的个人设备能访问媒体服务器”，而家人的设备只能使用出口节点。

### Tailscale Funnel

[Funnel](https://tailscale.com/kb/1223/tailscale-funnel) 是一个较新的功能，可以通过 Tailscale 基础设施把本地服务开放到**公网**，无需端口转发或公网 IP。这与我通常使用 Tailscale 的方向相反，但临时共享本地开发服务器时特别有用。

```bash
tailscale funnel 3000
```

就这样，Tailscale 会给你一个公开 HTTPS URL，指向本地 3000 端口。

### Tailscale Send

不用额外配置，就能直接在设备之间传文件：

```bash
tailscale file cp some-file.txt macbook-pro:
```

接收方从 Tailscale 应用中取文件。无需云存储或共享盘，就是直接的点对点传输。

### 共享设备

你可以把单台设备共享给 tailnet 之外的人，比如朋友、承包商或家人，而不让他们访问一切。对方通过链接接受共享后，在 Tailscale 应用里只能看到那台设备。这是提供有限访问权限的简洁方式，无需承担管理整张共享网络的负担。

---

## 一个取舍：控制平面

有一个取舍需要说清楚：虽然数据平面，也就是实际流量，是点对点且端到端加密的，但**控制平面运行在 Tailscale 的服务器上**。Tailscale 协调密钥交换和设备发现。这意味着，你需要信任这家公司不会滥用协调者角色。

对大多数个人和专业用途，这是完全合理的取舍。Tailscale 发布了[详细的安全模型](https://tailscale.com/security)，解释他们能看到什么、不能看到什么。如果需要完全自托管的协调服务，也有名为 [Headscale](https://github.com/juanfont/headscale) 的开源控制服务器，不过这会带来额外运维负担。

### Tailscale Lock

如果控制平面的信任问题让你不放心，内置的解决方案是 **Tailscale Lock**，也叫 `tailnet lock`。

通常由 Tailscale 协调服务器决定哪些设备获准加入 tailnet。启用 Tailscale Lock 后，仅凭这一点就不够了。每个新节点都必须先由受信任密钥进行**密码学签名**，其他设备才会接受它，即使 Tailscale 服务器说它合法也不例外。

这意味着，即使 Tailscale 控制平面被攻破，攻击者也不能悄悄向网络添加恶意设备。签名权掌握在现有的受信任节点手里。

```bash
# Initialize Tailscale Lock - generates a signing key on this device
tailscale lock init

# Sign a new node before it can join
tailscale lock sign <node-key>

# Check current lock status
tailscale lock status
```

这是高级功能，会增加操作负担。你需要有受信任的设备在线，为新节点签名。但如果 tailnet 后面运行着敏感服务，它能提供很有意义的额外保障，而且完全不受 Tailscale 控制。

---

## 最后的想法

对我来说，Tailscale 不只是又一款网络工具，而是一个**我乐于使用的方案**：简单、安全，强大却不张扬。无论是帮家人保持连接、访问自己的服务器，还是让服务保持私密，它都已成为日常工作流的一部分。

我最欣赏的是，它的能力可以逐步展开。你可以从两台设备互相通信开始，再慢慢用上出口节点、子网路由器、ACL 和 Funnel，无需推倒重来。好工具就是这种感觉。

如果你曾被传统 VPN 折腾得烦躁，很推荐试试 Tailscale。想了解我走到这一步的更完整故事，也可以看看之前的文章：[《随时随地用 iPhone 写代码》](/zh/posts/ssh-from-iPhone-to-Mac/)和[《深入网络调试》](/zh/posts/networking-deep-dive)。

---

*你在自己的环境里用过 Tailscale 吗？很想听听你的用法，尤其是我没想到的有创意的用途。*
