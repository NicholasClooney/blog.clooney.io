---
title: "通过 CrossOver 在 Apple silicon Mac 上使用 Quest PCVR"
date: 2026-05-22
time: "19:53"
tags:
  - vr
  - quest
  - macos
  - crossover
  - steamvr
excerpt: |
  尝试通过 CrossOver，在 Apple silicon Mac 上使用 Meta Quest 头显运行 PCVR 的调查记录，以及为什么真正的障碍是缺失的运行时栈。
---

这份笔记记录了一次调查：能否将 `Meta Quest` 头显作为 `HMD`，用于通过 `CrossOver` 在 `Apple silicon Mac` 上运行的 `PCVR` 游戏。

[[toc]]

## 目标

将 `Meta Quest` 头显作为 `HMD`，运行来自 `Mac` 的 `PCVR` 游戏，理想情况下使用 `CrossOver` 和 `Steam/SteamVR`。

当前限制：

- 主机：`Apple silicon Mac`
- 已安装 `CrossOver`
- 已在 CrossOver 中安装 `Steam`
- 没有另一台可用的 `Windows` PC

## 简要结论

`目前，通过 CrossOver 在 Apple silicon Mac 上获得可用的 Quest PCVR 体验，并不是一条现实可行的路径。`

真正的障碍不是让 `Steam` 或 `SteamVR` 启动，而是 `macOS` 缺少一套受支持、端到端完整的 `Quest PCVR` `VR runtime/compositor/driver` 栈，尤其是在 `Apple silicon` 上通过 `CrossOver` 运行时。

## 尝试或讨论过什么

- `Virtual Desktop`
- `CrossOver` 中的 `OpenXR`
- `ALVR`
- `Steam` 和 `SteamVR` 至少可以在 `CrossOver` 内启动
- 但 `SteamVR` 似乎需要 `Oculus/Meta PC runtime`，而 CrossOver 无法正确提供它

## 主要发现

### 1. macOS 上的 SteamVR 已属于旧版，不再受支持

Valve 于 **2020 年 4 月 30 日**停止了对 `macOS` 上 `SteamVR` 的支持。

来源：
- https://steamcommunity.com/app/250820/eventcomments/2268069450210517571

即使 `SteamVR` 的部分组件仍能启动，`macOS` 也已经不再是受支持的 PCVR 主机平台。在上面再叠加 `CrossOver`，起点本身就不受支持。

### 2. Meta Quest Link 是一套 Windows PC 技术栈

`Meta Quest Link` / `Air Link` 围绕受支持的 `Windows` 主机环境构建，而非 `macOS`。

官方要求页面：
- https://www.meta.com/help/quest/articles/headsets-and-accessories/oculus-link/requirements-quest-link/

`Quest` 没有与 Windows `Meta/Oculus` 运行时栈相当的官方 `macOS` PCVR 主机方案，CrossOver 也不会凭空补出一套。

### 3. ALVR 不能替代整个 VR 栈

`ALVR` 不是完整的独立 VR 运行时，而是作为 `SteamVR driver`／桥接层工作。

ALVR 文档说明：
- 驱动由 `SteamVR` 加载
- 通过 `OpenVR` 接口交互
- 依赖正常工作的 `SteamVR` 主机／运行时一侧

来源：
- https://github.com/alvr-org/ALVR
- https://github.com/alvr-org/ALVR/wiki/How-ALVR-works

这意味着，如果 `SteamVR` 只有部分功能可用，或缺少头显／运行时路径，`ALVR` 无法解决核心问题。在 macOS 的 `CrossOver` 内运行 `ALVR` 服务器，并不是构建受支持 Quest PCVR 主机的实用途径。

### 4. ALVR 不支持 macOS 作为服务器主机

ALVR 公布的兼容性说明是：

- `Windows 10/11`：支持
- `Linux`：支持
- `macOS`：不支持

来源：
- https://github.com/alvr-org/ALVR

`macOS` 没有官方 `ALVR` 串流端／服务器方案，因此尝试在 `CrossOver` 内运行 Windows 一侧的程序，又增加了一层不受支持的行为。

### 5. macOS 上的 Virtual Desktop 不是 PCVR 解决方案

`Virtual Desktop` 支持连接 `macOS` 进行平面桌面串流，但它自己的 FAQ 说明，PCVR 游戏串流需要一台支持 VR 的 `Windows` PC，而且“无法在 Mac 上工作”。

来源：
- https://www.vrdesktop.net/

Mac 上的 `Virtual Desktop` 能提供一块巨大的虚拟显示器，但并不提供从 `macOS` 将 Quest 用作 PCVR 头显的受支持路径。

## 为什么“Steam/SteamVR 能在 CrossOver 中启动”还不够

启动应用是容易的部分，难的是完整的 `PCVR runtime pipeline`。

要让这套方案工作，以下各项都必须正常：

1. `SteamVR` 必须作为真正的 VR 主机运行时工作，而不只是打开界面。
2. 必须有有效的头显运行时路径，让 `Quest` 被识别为可用的 HMD。
3. 游戏必须通过预期的 VR 图形路径渲染。
4. VR 合成器必须正确接收并呈现这些帧。
5. `ALVR` 或其他传输方案必须以低延迟捕获并编码这些帧。
6. 头部追踪和控制器数据必须快速、可靠地返回主机。
7. 音频、麦克风、视角重置、按键绑定和时序都必须在往返过程中正常工作。

普通游戏的兼容性中，部分 API 支持有时就够了。`VR` 通常不行。`VR` 对以下因素格外敏感：

- 帧时序
- 合成器行为
- 运动预测
- 低延迟编码／解码
- 设备与运行时集成
- 追踪数据的往返延迟

## 这套具体配置可能遇到的故障顺序

### 1. 缺少 Oculus/Meta 运行时路径

这似乎已经是遇到的第一个明确障碍。

如果 `SteamVR` 或游戏要求 `Meta/Oculus PC runtime`，`CrossOver` 立刻就进入了不受支持的领域。

### 2. SteamVR 主机／运行时只有部分功能可用

即使 `SteamVR` 能启动，也未必能在 `CrossOver` 内提供稳定、可用的 HMD／运行时路径。

### 3. ALVR 驱动集成失败或不完整

由于 `ALVR` 是一个 `SteamVR driver`，它依赖正确的 `SteamVR` 驱动加载和合成器行为。

### 4. 帧提交／合成器路径出错

即使窗口能打开，帧传递路径仍可能失败：

- 纹理共享失效
- 呈现错误
- 时序问题
- 合成器不兼容

### 5. 视频编码路径不可用

即使 VR 运行时一侧勉强能工作，经过转译的技术栈仍需要适合 VR 串流的低延迟视频编码。

### 6. 动作到画面的延迟过高，无法实际使用 VR

这就是一个“技术上还活着”的原型，在实际使用中依然可能不可用的地方。

## 为什么 CrossOver 内的 ALVR 难以实际使用

简要说来：

`CrossOver 有时能转译足够多的 Windows 行为，让应用启动；但 PCVR 依赖的恰恰是这套配置没有提供的运行时／合成器／驱动栈。`

原因包括：

- `ALVR` 依赖正常工作的 `SteamVR` 主机栈
- `SteamVR` 在 `macOS` 上不受支持
- `Quest Link` / `Oculus runtime` 属于 `Windows` 路径
- `CrossOver` 转译 Windows 用户态 API，但 PCVR 还依赖更紧密的运行时、驱动与 GPU 集成
- `Apple silicon` 增加了脆弱性，因为转译栈位于不同的平台和 GPU 架构之上

因此这是架构问题，不是少了某项小调整。

## 没有 Windows PC 时的现实选择

如果没有另一台可用的 `Windows` 机器，现实选择很有限：

1. 玩游戏的 `Quest` 原生版本。
2. 将 `Quest` 用作巨大的虚拟显示器，玩平面 Mac 游戏或用于工作。
3. 未来使用另一台机器作为 VR 主机。`Windows` 最实用；`Linux + ALVR` 也可能可行，但仍比 Windows 小众。

## 不值得投入太多时间的不现实路径

- 在 macOS 上运行 ALVR 服务器
- 在 Apple silicon macOS 的 CrossOver 内运行 ALVR 服务器
- 用 macOS 上的 Virtual Desktop 做 PCVR
- 指望 macOS 上的 SteamVR 提供现代、受支持的 Quest 路径
- 指望 `CrossOver` 替代 `Meta/Oculus PC runtime`

## 结论

`Steam` 能在 CrossOver 中启动，不等于拥有一套受支持的 `Quest PCVR runtime stack`。

阻碍这套配置的是缺失的、面向 `Quest` 的主机运行时／合成器／驱动路径，而不是单独缺了某个应用或开关。
