---
title: "macOS 浏览器无法打开网站，但 `ping`、`ssh` 和 `dig` 仍然正常"
date: 2026-03-04
tags:
  - macos
  - dns
  - tailscale
  - pi-hole
  - networking
  - troubleshooting
  - devops
excerpt: |
  浏览器打不开网站，而 `ping`、`ssh` 和 `dig` 仍能工作，可能意味着 macOS 的不同解析路径出现了分化故障。本文介绍 Tailscale + Pi-hole 配置如何触发解析器状态损坏，以及为什么重置 DNS 设置会立即解决问题。
---

最近，我在 macOS 上使用 **Tailscale 和 Pi-hole** 自定义 DNS 配置时，遇到了一个奇怪的网络问题。这套配置也就是我的[私有入口引擎](/zh/posts/a-everywhere-accessible-but-publicly-invisible-ingress-engine/)。

这台机器显然有网络连接：

* `ssh` 正常
* `parsec` 正常
* `ping 1.1.1.1` 正常
* `dig` 能解析域名

但 **Safari 和 Firefox 都无法打开任何网站**。

公共域名不行：

```text
youtube.com
```

私有域名也不行：

```text
private.clooney.io
```

更奇怪的是，清除 DNS 缓存毫无效果，但在 macOS 网络设置中重设 DNS 服务器，问题立刻就消失了。

深入调查后发现，这是 **macOS 分流 DNS 解析器状态损坏**，再叠加一条涉及 Tailscale 和容器化 Pi-hole 的复杂 DNS 路径所导致的问题。

[[toc]]

---

## 我的配置

> 详细说明见我的[私有入口引擎](/zh/posts/a-everywhere-accessible-but-publicly-invisible-ingress-engine/)一文。

我的机器都在同一个 Tailscale tailnet 内，使用自定义 DNS。

MacBook Air 指向 Tailscale MagicDNS：

```text
DNS server: 100.100.100.100
```

架构如下：

```text
MacBook Air
    ↓
100.100.100.100 (Tailscale MagicDNS)
    ↓
Pi-hole DNS server
    ↓
Upstream resolvers
```

Pi-hole 实例本身运行在另一台机器上的容器里：

```text
MacBook Pro
 └─ Docker container
     └─ Pi-hole
         └─ connected to a Tailscale container (service mode)
```

因此，DNS 解析实际上会经过多层：

```text
MacBook Air
 → Tailscale MagicDNS proxy
 → tailnet tunnel
 → MacBook Pro
 → Docker container network
 → Pi-hole
 → upstream DNS
```

换句话说，一次 DNS 请求涉及**两次 Tailscale 跳转和一个容器网络边界**。

---

## 症状

问题出现时，系统表现如下：

| 工具 | 结果 |
| ---------------- | ------- |
| `ping 1.1.1.1` | ✅ 正常 |
| `ssh server` | ✅ 正常 |
| `dig google.com` | ✅ 正常 |
| `dns-sd -G v4 google.com` | ❌ 失败 |
| Safari | ❌ 失败 |
| Firefox | ❌ 失败 |
| 私有域名 | ❌ 失败 |

所以很明显：

* 网络栈正常
* DNS 服务器可达
* 但浏览器无法解析域名

---

## 关键细节：macOS 有两条 DNS 路径

令人困惑的是，`dig` 可以工作：

```bash
dig google.com
```

这是因为 macOS 实际上有**两条不同的 DNS 解析路径**。

### 1. 系统解析器

许多命令行工具使用它。

由以下进程处理：

```text
mDNSResponder
```

经常走这条路径的工具包括：

* `ping`
* `dig`
* `ssh`
* 各种系统工具

### 2. Network.framework 解析器

较高层的网络 API 会使用它，例如：

```text
URLSession
Network.framework
```

浏览器大量依赖这条路径。

这个解析器还会做额外验证，例如：

* 检查 DNS 服务器是否响应
* 重试逻辑
* 回退到 DNS-over-TCP
* 更严格的错误处理

因此，浏览器往往**更难容忍局部 DNS 故障**。

---

## 实际发生了什么

机器最终进入了**部分损坏的 DNS 状态**。

```text
System resolver (mDNSResponder)   → still working
Network.framework resolver        → stuck / unhealthy
```

于是出现了这样的表现：

| 工具 | 结果 |
| -------- | ------ |
| `dig` | 正常 |
| `ping` | 正常 |
| `ssh` | 正常 |
| `dns-sd` | 失败 |
| 浏览器 | 失败 |

这就解释了为什么机器看起来正常，浏览器却坏了。

---

## 为什么 Tailscale + Pi-hole 会遇到这个问题

这套配置中的 DNS 路径相当长：

```text
Air
 ↓
Tailscale MagicDNS proxy
 ↓
tunnel
 ↓
MacBook Pro
 ↓
Docker network
 ↓
Pi-hole
```

只要其中任何组件短暂出问题，例如：

* MacBook Pro 进入睡眠
* 容器重启
* Docker 网络变化
* Pi-hole 负载过高
* Tailscale 重连

Air 上的 MagicDNS 代理就可能进入**降级状态**。

在这种状态下：

* 一些查询仍然成功
* 但某些响应可能格式错误、被截断或出现延迟

可能的故障模式包括：

* DNS 响应被截断
* 返回 `SERVFAIL`
* 回退到 DNS-over-TCP 失败
* 上游暂时不可用

命令行工具往往能容忍这些问题。

浏览器通常不能。

---

## 为什么重置 DNS 有效

切换 DNS 设置会强制 macOS **重建解析器配置**。

这会重置以下组件的内部状态：

```text
Network.framework
mDNSResponder
per-interface DNS resolvers
```

关键是，这**不等于清除 DNS 缓存**。

---

## 为什么清除 DNS 缓存没用

常见建议是运行：

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

这会清除缓存的 DNS 记录。

但这里的问题是**与解析器的连接状态**，而不是缓存记录。

---

## 快速重置 macOS DNS 状态的脚本

每次都到系统设置里手动切换 DNS，很快就会让人厌烦。

既然修复方法是强制 macOS 重建解析器配置，就可以用一个小脚本自动完成。

思路如下：

1. 清空 DNS 服务器和搜索域
2. 稍等一下，让 macOS 发出 `configd` 事件
3. 恢复 DNS 配置

示例脚本：

```bash
#!/bin/bash

# Primary network interface (usually en0 on MacBook Air Wi-Fi)
IFACE="en0"

# Grab current Tailscale DNS settings
CURRENT_DNS=$(networksetup -getdnsservers "$IFACE")
CURRENT_SEARCH=$(networksetup -getsearchdomains "$IFACE")

# Clear DNS + search domains (forces configd update)
networksetup -setdnsservers "$IFACE" empty
networksetup -setsearchdomains "$IFACE" empty

sleep 1

# Restore DNS configuration
networksetup -setdnsservers "$IFACE" 100.100.100.100
networksetup -setsearchdomains "$IFACE" your.tailnet.name.ts.net
```

运行这个脚本，实际效果等同于在 macOS 网络界面里切换 DNS 设置。

因为它会触发两次 `configd` 事件：

```text
clear DNS → configd rebuild
restore DNS → clean resolver initialization
```

这会重置以下两者使用的解析器状态：

```text
mDNSResponder
Network.framework
```

因此，浏览器马上就能重新解析域名。

---

## 可选：清除 DNS 缓存

如果还想清除缓存记录：

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
sudo killall mDNSResponderHelper
```

实际使用中，只重置解析器通常就够了。

---

## 有用的调试命令

如果再次遇到这个问题，可以先用这些命令诊断，再重置。

检查连通性：

```bash
ping 1.1.1.1
```

直接检查 DNS：

```bash
dig @100.100.100.100 google.com
```

检查 macOS 解析器：

```bash
dscacheutil -q host -a name google.com
```

查看解析器配置：

```bash
scutil --dns
```

测试浏览器所用的解析路径：

```bash
dns-sd -G v4 google.com
```

---

## 可能的根本原因

最可能的发生顺序大致如下：

```text
MacBook Air sleeps
↓
Tailscale reconnects
↓
Pi-hole container briefly unavailable
↓
MagicDNS proxy enters degraded state
↓
Network.framework resolver rejects responses
↓
Browsers fail DNS lookups
```

重置 DNS 会强制 macOS 重建解析器配置。

---

## 收获

如果你遇到以下情况：

* 浏览器无法打开网站
* `ping` 正常
* `ssh` 正常
* `dig` 正常

问题可能是 **macOS 解析器状态损坏**，而不是网络连接故障。

在使用以下组件的自定义 DNS 配置中，尤其容易出现这种边界情况：

* Tailscale
* Pi-hole
* 容器化 DNS 服务器
* 私有域名

重置 DNS 配置，或关闭后重新启用网络接口，通常就能解决。
