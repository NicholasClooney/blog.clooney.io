---
title: "在英国移动网络上调试 Tailscale：探索 NAT、DERP 和 IPv6"
date: 2025-09-29
tags:
  - tailscale
  - networking
  - private-network
  - infra
  - devops
---

## 引言

一开始只是一个简单的问题：*“为什么 iPhone 使用移动数据时，无法通过 Tailscale 连接我的 MacBook？”* 最后却变成了对 NAT 类型、中继服务器以及 IPv6 隐藏潜力的深入探索。这篇文章记录了整个技术排查过程、走过的弯路和最终结论。

---

[[toc]]

## 我当时遇到的问题

* 使用**英国移动数据**时，iPhone 能通过 Tailscale 正常 SSH 到一台位于美国的 VPS。
* 但尝试连接家中使用 Hyperoptic 宽带的 MacBook 时，却失败了。
* MacBook 上运行 `tailscale ping iphone` 超时；iPhone 上运行 `tailscale ping mac` 显示 `relay LHR`，但仍然失败。
* 在**同一个 Wi-Fi 网络**中，iPhone ↔ Mac 完全正常。

问题来了：为什么连 VPS 可以，连 Mac 却不行？

> *继续往下读，最后发现只需要一个简单修复！*

---

## 最初的线索

1. **Mac 上 Tailscale netcheck 的初始结果**：

   ```
   IPv6: no
   IPv4: yes, behind NAT
   PortMapping: UPnP, NAT-PMP, PCP
   MappingVariesByDestIP: false
   ```

   → 起初 Mac 没有 IPv6。它位于 NAT 后面，但路由器支持端口映射，因此不是对称型 NAT。

2. **Ping 结果**：

   * `tailscale ping debian (VPS)` → 成功，使用直连 IPv4 路径。
   * `tailscale ping iphone` → 失败，即使通过中继（DERP LHR）也不行。

3. **排除了休眠原因**（Mac 已设置为永不休眠）。

---

## 发现双重 NAT

最初 Mac 位于**双重 NAT** 之后（家用路由器 + ISP 设备）。把路由器直接接上后：

* WAN IP 显示为 `100.71.x.x`，属于 `100.64.0.0/10`，证实存在**运营商级 NAT（CGNAT）**。
* 结果：Mac 仍然无法通过 IPv4 直接访问。

---

## 尝试 IPv6

Hyperoptic 提供 IPv6（以下为说明用的虚构示例地址）：

* 路由器获得了一个 `/56` 前缀：`2a01:abcd:1234::1/56`
* Mac 获得了全局 IPv6：`2a01:abcd:1234::97d2`
* 浏览器测试确认：Mac 可以通过 IPv6 从全球访问。

这是个突破：Mac 不再受 NAT 阻碍。

---

## 测试 iPhone

缺失的环节是 iPhone 的移动连接：

* iPhone 只使用移动数据访问 [https://test-ipv6.com/](https://test-ipv6.com/)（避开 Safari，以免开启了 Private Relay）时，结果显示：**IPv6: no**。
* 确认：iPhone 只有 IPv4（CGNAT）。
* Safari Private Relay 曾短暂让我们误以为已有 IPv6，但那只是 Apple 的代理。

结论：**iPhone 的移动网络只有 IPv4，并使用 CGNAT**。

---

## 为什么 VPS 能连，Mac 不能

* **iPhone → VPS**：VPS 有公网 IPv4，因此直连成功。
* **Mac → VPS**：Mac 可以向外发起连接，因此成功。
* **iPhone ↔ Mac**：两端都在 NAT/CGNAT 后面，没有直接路径，必须使用 DERP。
* **但移动运营商网络上的 DERP 中继（UDP）不可靠**，导致丢包。

---

## 最终发现

1. **Mac 没问题**：有了 IPv6，它可以从全球访问。
2. **VPS 没问题**：公网 IPv4 让连接很容易。
3. **最初的阻碍来自 iPhone 的移动运营商**：

   * 起初不支持 IPv6，只能困在 IPv4 CGNAT 中。
   * DERP UDP 流量不稳定或被阻止，导致中继回退失败。
4. **那个简单修复**：后来，在正确激活英国 SIM 卡后，iPhone 突然获得了一个公网 IPv4（85.xxx.xxx.xxx）。这让 **iPhone ↔ Mac 可以直接连接**，无需 DERP。

---

## 可考虑的绕行方案

（如果你的移动网络没有公网 IPv4 地址）

* Mac 端：可以强制使用 DERP，确保走中继，但真正的问题在 iPhone 一侧。
* 另一种方式：让 VPS 充当 iPhone → Mac 流量的**出口节点／中继**。
* 长期解决办法：换一家提供**公网 IP 地址**或**移动数据 IPv6** 的运营商。

---

## 结论

这段漫长的排查让我看到，Tailscale 这类点对点 VPN 能否成功连接，有多依赖底层网络：

* CGNAT 会破坏 IPv4 的点对点连接。
* DERP 中继能救场，除非运营商过滤 UDP。
* IPv6 才是真正的解决办法，但前提是*两端*都支持。

在我们的情况里，Mac 已经准备好了，iPhone 的移动运营商却没有。得到的教训是：有时问题不在设备或 Tailscale，而在你与互联网之间那些看不见的网络策略。
