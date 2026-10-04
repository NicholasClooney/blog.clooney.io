---
title: "Virtual Desktop / CrossOver 调查记录"
date: 2026-05-22
time: "19:54"
tags:
  - vr
  - virtual-desktop
  - crossover
  - openxr
  - troubleshooting
excerpt: |
  在 CrossOver 容器中测试 Virtual Desktop Streamer 的记录，包括启动失败、不稳定的 OpenXR 会话，以及为什么修好 .NET 后整套方案仍然无法维持运行。
---

这份记录来自在 macOS 多个 `CrossOver` 容器中测试 `Virtual Desktop Streamer` 的过程，重点关注启动行为、`OpenXR` 运行时状态，以及整套方案在哪些环节失效。

[[toc]]

## 容器

- `Test`
- `VD Test 2`

## 概况

出现了两个不同的问题：

1. 在 `Test` 中，`Virtual Desktop Streamer` 可以启动，但 VR 会话不稳定，会自行断开。
2. 在 `VD Test 2` 中，`Virtual Desktop Streamer` 目前无法启动，因为应用启动时没有加载 `mscoree.dll`。

## `Test` 容器

### OpenXR 运行时注册

`Test/system.reg` 包含：

- `HKLM\\Software\\Khronos\\OpenXR\\1\\ActiveRuntime` -> `C:\\Program Files\\Virtual Desktop Streamer\\OpenXR\\virtualdesktop-openxr.json`
- `HKLM\\Software\\WOW6432Node\\Khronos\\OpenXR\\1\\ActiveRuntime` -> `C:\\Program Files\\Virtual Desktop Streamer\\OpenXR\\virtualdesktop-openxr-32.json`

这些引用的 JSON 文件都存在于容器内。

### Elite Dangerous

Elite 已通过 Virtual Desktop 游戏设置配置为以 VR 模式启动：

- 应用 ID `359320`
- `/Steam /VR`
- `OpenVRSupport: true`

### SteamVR 路径

SteamVR 日志显示，Elite 尝试初始化 VR，但因头显／运行时错误而失败：

- `VRInitError_VendorSpecific_OculusRuntimeBadInstall`
- `VRInitError_Init_HmdNotFound`

Elite 确实进入了 VR 路径，但 `SteamVR` 始终没拿到可用的头显。

### OpenComposite 路径

将针对单个游戏的 OpenComposite DLL 放进了 Elite 本地的 OpenVR 文件夹：

- `.../Openvr/win64/openvr_api.dll`
- `.../Openvr/win32/openvr_api.dll`

随后观察到：

- 开启全局 OpenComposite 时，Steam 启动失败：
  - `OpenComposite DLLMain ERROR: Cannot init VR: unsupported apptype 6`
- 将全局运行时切回 SteamVR，只保留游戏内的 DLL 钩子后，Elite 到达了这条路径：
  - `Elite -> OpenComposite -> Virtual Desktop OpenXR runtime`

接着 OpenComposite 以两种主要错误形式失败：

- `xrGetSystem(...)` 处出现 `XR_ERROR_FORM_FACTOR_UNAVAILABLE`
- `xrCreateSession(...)` 处出现 `XR_ERROR_RUNTIME_FAILURE`

解释：

- `FORM_FACTOR_UNAVAILABLE`：运行时已加载，但当时没有暴露 `HMD`
- `RUNTIME_FAILURE`：运行时推进得更远，但会话创建失败

### `hello_xr.exe` 探测

也在 `Test` 容器里测试了 OpenXR loader 包中预构建的 `hello_xr.exe`。

观察到的行为：

- 启动后立即退出
- 有时返回 `1`
- Virtual Desktop 连接可能同时断开

这与 `OpenComposite` 测试指向相同的底层问题：容器中的 `VDXR/OpenXR` 路径不稳定，并不是 `Elite` 特有的问题。

### `Test` 的当前结论

`Test` 的限制因素位于 Elite 的上游：

- `Virtual Desktop Streamer` 会自行断开
- OpenXR 会话启动不稳定
- 应用层的 VR 失败只是下游症状

## `VD Test 2` 容器

### 检查过什么

- VC++ 运行时文件存在
- 将容器改为 Windows 10 没有解决启动问题
- `Program Files` 中的安装内容与 `Test` 大体相似

因此，新容器的主要障碍看起来不是 VC++，也不是所选的 Windows 版本。

### 应用日志

在 `VD Test 2` 中，`Virtual Desktop Streamer` 失败前没有生成有用的应用日志。

这说明它可能在启动的非常早期就失败了。

### CrossOver 启动日志

有用的日志文件：

- `~/Library/Logs/CrossOver/VD Test 2.cxlog`
- `~/Library/Logs/CrossOver/VD Test 2 2.cxlog`

`VD Test 2 2.cxlog` 中最新一次运行显示了相关故障：

- `VirtualDesktop.Streamer.exe` 启动
- 随后：
  - `Failed to load module L"mscoree.dll"; status=c0000135`
  - `mscoree.dll not found, IL-only binary L"VirtualDesktop.Streamer.exe" cannot be loaded`
  - `Importing dlls for L"C:\\Program Files\\Virtual Desktop Streamer\\VirtualDesktop.Streamer.exe" failed, status c0000135`

这就是目前阻止应用在 `VD Test 2` 中启动的明确障碍。

### 同一日志中的其他干扰信息

同一份日志还包含：

- `failed to create driver ... Services\\winebth`
- `Auto-start service L"winebth" failed to start: 1359`
- `RPC_S_SERVER_UNAVAILABLE`

这些以后可能也有影响，但最新日志中第一个与应用直接相关的错误，仍然是 `mscoree.dll` 加载失败。

## OpenXR loader 包

下载的包：

- `~/Downloads/openxr_loader_windows-1.1.60.zip`

有用的内容：

- `x64/bin/hello_xr.exe`
- `x64/bin/openxr_runtime_list.exe`
- `x64/bin/openxr_loader.dll`
- `x64/lib/openxr_loader.lib`
- `include/openxr/openxr.h`
- `include/openxr/openxr_platform.h`

这个包足以直接运行 `hello_xr.exe` 这样的探测程序，无需在本地构建。

## 当前诊断

### `Test`

- Virtual Desktop 能启动，但运行时／会话路径不稳定
- CrossOver 下的 VDXR/OpenXR 还不够稳定，不能依赖

### `VD Test 2`

- Virtual Desktop 目前无法启动，因为应用没有加载 `mscoree.dll`
- 看起来是新容器中的 .NET/CLR 引导问题

### `VD Test 3`

- 新建容器
- 先安装 `.NET 4.8`
- `Virtual Desktop Streamer` 能启动
- Quest 可以短暂连接
- 随后连接仍会自行断开

这一点很重要，因为它排除了更简单的解释：整套方案的失败不只是新容器里缺少 `.NET` 依赖。

## 更新后的结论

多个容器反复断开，指向更深层的兼容性问题：

- `Virtual Desktop Streamer` 预期存在真实的 Windows 桌面／会话和图形捕获路径
- CrossOver 容器没有提供正常的 Windows 显示／合成器环境
- 串流端看起来可以启动并接受连接，但没有真实的 Windows 桌面供它呈现
- 随后会话断开，下游的 OpenXR/VDXR 调用也相继失败

目前最合理的解释是平台不匹配：

- 在 CrossOver 中运行 Windows 版 `Virtual Desktop Streamer`，不是 VR 运行时或头显追踪的稳定基础
- Elite/OpenComposite/OpenXR 错误是这种不匹配的下游症状

## 关于 macOS 串流端

Virtual Desktop 官网区分了：

- macOS 上的桌面串流
- Windows 上的 PCVR 游戏串流

其当前 FAQ 说明，PCVR 游戏串流需要一台运行 Windows、支持 VR 的 PC，而且“无法在 Mac 上工作”。

因此，应将 macOS 串流端视为桌面串流路径，而不是受支持的 PCVR 运行时路径，也不应假定它提供了可用的、兼容 `OpenXR`/`SteamVR` 的追踪接口。

这与 CrossOver 中观察到的行为一致：

- 短暂连接
- 容器背后没有真实的 Windows 桌面／会话
- 连接后很快断开
- 下游出现 OpenXR 失败

## 头部位姿问题

### 从 macOS 上的 Virtual Desktop Streamer 获取

没有找到 macOS Virtual Desktop Streamer 提供的、已记录或受支持的头部位姿 API。

### 从 ADB／调试工具获取

没有找到标准 ADB 命令或通用调试数据流，能从当前运行的 Virtual Desktop 会话中获取 Quest 实时头部位姿。

ADB 适用于：

- 安装／启动
- `logcat`
- shell 访问
- 开发工作流

它不是从任意前台 VR 应用获取实时头显位姿的通用、受支持数据源。

### 实际启示

如果真正的目标是提取 Quest 3 的头部运动数据，可靠架构很可能是：

- 一个原生 Quest 应用，从头显运行时读取位姿并发送出去
- 或真实的 Windows PCVR／运行时路径，通过受支持的 API 提供追踪数据

不应把 `Virtual Desktop on Quest + macOS streamer + CrossOver bottle` 这条路径视为可靠的头部位姿来源。

## 后续步骤

1. 不再主要把它当作 Elite 配置问题。
2. 除非存在真实的 Windows 桌面／会话，否则应假定 CrossOver 内的 Windows Virtual Desktop Streamer 不是可靠路径。
3. 如果目标是头显追踪或 VR 运行时访问，就寻找不依赖容器内 Windows 串流端的路径。
