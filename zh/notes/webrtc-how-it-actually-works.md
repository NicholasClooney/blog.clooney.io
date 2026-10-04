---
title: "WebRTC 的实际工作原理"
date: 2026-04-16
tags:
  - networking
  - security
excerpt: |
  理解 WebRTC 的实用思路：你来构建信令，浏览器处理 ICE/DTLS/SRTP，直连失败时由 TURN 兜底。
---

WebRTC 让浏览器和原生应用实时交换音频、视频及任意数据，不必让所有流量都经过服务器。“点对点”这个说法很吸引人，却省略了不少事情：你仍需要构建信令、运维 STUN/TURN 服务器，并为始终无法直连的连接设计回退路径。

从底层看，WebRTC 是两部分相对独立的工作叠加在一起：由你完全自行设计的*信令层*，以及由浏览器负责的*传输层*。

> **理解方式：** 信令（你来构建）+ 通过 STUN/TURN 穿透 NAT + 加密 P2P 传输（浏览器）= WebRTC

---

## 关键组件

五个组件相互配合，建立连接。其中三个由你运维，两个由浏览器运行时处理。

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin:1.5rem 0;font-family:system-ui,sans-serif">
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#8b7ff5;margin-bottom:10px;font-weight:500">信令服务器</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">不属于 WebRTC 规范，由你构建。在对等端之间交换 SDP offer/answer 和 ICE 候选地址，常用 WebSocket 或 Socket.IO 实现。</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#5b9bd5;margin-bottom:10px;font-weight:500">STUN</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">回答“我的公网 IP／端口是什么？”运行成本低，大多数 P2P 路径都需要它。</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#5ba85b;margin-bottom:10px;font-weight:500">TURN</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">完整的中继回退方案。P2P 直连失败时，流量经由你的服务器转发，带宽成本随用量增长。</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#c8a040;margin-bottom:10px;font-weight:500">ICE</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">收集候选路径（本机、STUN 反射地址、TURN 中继），并行测试，再选出最佳可用路由。</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#d47fa0;margin-bottom:10px;font-weight:500">SFU（可选）</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">用于多人通话。每个对等端只发送一份，由 SFU 分发，避免 O(n²) 的网状连接。例如 mediasoup、LiveKit。</div>
  </div>
</div>

---

## 连接流程

连接按顺序经过六个阶段。前三个通过你的信令通道完成，后面由浏览器处理。

**01：建立信令连接**
双方连接信令服务器，加入会话或房间。

**02：Offer / Answer（交换 SDP）**
呼叫方生成 SDP offer，接收方返回 SDP answer。其中包含编解码器、媒体类型和加密参数。

**03：交换 ICE 候选地址**
每个对等端收集候选地址（本地、STUN 反射地址、TURN 中继），并通过信令通道发送。

**04：连通性检查**
ICE 对每一组候选地址对发送 STUN 绑定请求，直到找到可用路径。

**05：建立安全传输**
通过 DTLS 交换密钥，媒体使用 SRTP，数据通道使用运行在 DTLS 上的 SCTP。这些都是强制要求，WebRTC 始终加密。

**06：传输**
ICE 找到可用路径就使用 P2P 直连，否则通过 TURN 中继。大多数企业／移动网络连接会回退到中继。

---

## 协议栈

| 协议 | 层 | 作用 |
|----------|-------|--------------|
| SDP | 信令 | 会话描述：编解码器、媒体类型、加密参数 |
| ICE | 传输 | 路径发现、候选测试、路由选择 |
| STUN | 传输 | 发现 NAT 映射，回答“我的公网地址是什么？” |
| TURN | 传输 | P2P 直连失败时使用的中继服务器 |
| DTLS | 安全 | 在 UDP 上进行加密握手 |
| SRTP | 媒体 | 加密的音视频传输 |
| SCTP | 数据 | 数据通道传输，运行在 DTLS 上 |

---

## 取舍

<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:1.5rem 0;font-family:system-ui,sans-serif">
  <div style="background:#1a2e1a;border:1px solid #2d4a2d;border-radius:10px;padding:16px 20px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;color:#5ba85b;margin-bottom:12px;font-weight:500">优势</div>
    <ul style="list-style:none;padding:0;margin:0">
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>良好的 P2P 路径下，延迟低于 100ms</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>加密是强制要求，不是可选项</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>浏览器自带，无需插件</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>同时承载媒体和任意数据</li>
    </ul>
  </div>
  <div style="background:#2e1a1a;border:1px solid #4a2d2d;border-radius:10px;padding:16px 20px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;color:#c06060;margin-bottom:12px;font-weight:500">需要留意</div>
    <ul style="list-style:none;padding:0;margin:0">
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>信令与 NAT 配置并不简单</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>TURN 带宽成本随负载增长</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>并非总是真正的 P2P，TURN 中继很常见</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>排查 ICE 失败很费劲</li>
    </ul>
  </div>
</div>

---

> **关键认识：** 尽管宣传强调“点对点”，现实中许多 WebRTC 连接会经过 TURN 中继，尤其是移动网络，以及 NAT 或防火墙严格的企业环境。规划时，要预期 TURN 服务器会承载相当一部分流量。
