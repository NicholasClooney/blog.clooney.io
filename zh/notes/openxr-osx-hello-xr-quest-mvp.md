---
title: "最小 OpenXR-OSX MVP：从 macOS 在 Quest 上运行 hello_xr"
date: 2026-05-22
time: "22:01"
tags:
  - vr
  - quest
  - macos
  - openxr
  - hello-xr
excerpt: |
  一份尽可能小的测试计划：让原生 macOS hello_xr 示例连接 OpenXR-OSX，并通过 Quest 客户端显示。
---

如果目标是证明 [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) 能从原生 `macOS` `OpenXR` 应用驱动 `Quest` 头显，这就是我会先尝试的最小测试。

这是那次成功运行的短视频：

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/slwVUBdZR1Y"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    title="从 macOS 在 Quest 上运行 OpenXR-OSX hello_xr"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

[[toc]]

## 范围

这不是 `CrossOver`、`SteamVR` 或 `Elite Dangerous` 的指南。

它关注一个更小的问题：

`我能否运行原生 macOS OpenXR 示例，让它指向 OpenXR-OSX，并在 Quest 客户端上看到整条路径工作起来？`

如果这一步失败，就没有必要把 Windows 端实验搞得更复杂。

## 简要步骤

最小但可信的 MVP 是这样的：

1. 在 Mac 上构建 `OpenXR-OSX` 运行时
2. 用 `XR_RUNTIME_JSON` 为从 shell 启动的应用注册运行时
3. 从同一仓库构建并安装 Quest Android 客户端
4. 构建原生 macOS `hello_xr`
5. 从同一个 shell 运行 `hello_xr`，确保它能找到运行时

如果这条路径不通，我会先停下来调试，再去碰 `CrossOver`。

## 它应该证明什么

如果成功，这个测试应该能同时证明几件事：

- `OpenXR-OSX` 运行时可以构建并加载
- 原生 macOS `OpenXR` 应用能发现运行时
- Quest 客户端能在局域网找到运行时
- 运行时能创建会话，并开始通过 Quest 路径呈现画面

它**不能**证明 Windows 游戏、`OpenComposite` 或 `CrossOver` 桥接设想可行。

## 前提条件

上游当前为所支持的路径列出了这些要求：

- `Apple Silicon Mac`
- `macOS 13+`
- `Xcode` 及命令行工具
- `cmake`
- `ninja`
- `Java 17`
- `Android SDK`
- `Android NDK`
- `adb`
- 处于开发者模式的 `Quest`

文档：

- [`OpenXR-OSX` README](https://github.com/demonixis/OpenXR-OSX)
- [`docs/build.md`](https://github.com/demonixis/OpenXR-OSX/blob/main/docs/build.md)
- [`docs/platforms/quest.md`](https://github.com/demonixis/OpenXR-OSX/blob/main/docs/platforms/quest.md)
- [`docs/platforms/macos-companion.md`](https://github.com/demonixis/OpenXR-OSX/blob/main/docs/platforms/macos-companion.md)

## 最小操作顺序

### 1. 构建 macOS 运行时

从本地 fork 开始：

```bash
cd ~/Source/Forks/fork-OpenXR-OSX
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Debug
cmake --build build
ctest --test-dir build --output-on-failure
```

预期输出：

- `build/runtime/libopenxr_osx.dylib`
- `build/runtime/openxr_osx.json`
- `build/runtime/openxr_osx.toml`

### 2. 为终端启动的应用注册运行时

首次测试，我会避开 GUI 注册，采用上游文档中的 shell 方式：

```bash
export XR_RUNTIME_JSON="$HOME/Source/Forks/fork-OpenXR-OSX/build/runtime/openxr_osx.json"
```

相比辅助脚本或 macOS 配套应用，这能让第一次运行更简单。

### 3. 构建并安装 Quest 客户端

```bash
cd ~/Source/Forks/fork-OpenXR-OSX/clients/android-openxr
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

上游说明，`clients/android-openxr/local.properties` 必须指向本地 Android SDK。

### 4. 启动 Quest 客户端

在头显上：

- 打开已安装的 Android 客户端
- 保持头显唤醒
- 让 Mac 和 Quest 连接同一个局域网

`adb` 安装与启动命令示例：

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.openxrosx.client -c android.intent.category.LAUNCHER 1
```

如果连接了多个 `adb` 设备，明确指定头显：

```bash
adb -s <device-id> install app/build/outputs/apk/debug/app-debug.apk
adb -s <device-id> shell monkey -p com.openxrosx.client -c android.intent.category.LAUNCHER 1
```

按文档描述，Quest 客户端会在局域网中发现运行时、建立连接、接收编码后的视频帧，并回传头部和控制器数据。

### 5. 构建原生 macOS `hello_xr`

示例本身使用 Khronos 的 `OpenXR-SDK-Source`，`hello_xr` 就在其中。

文档给出的最小 macOS 项目生成流程：

```bash
git clone https://github.com/KhronosGroup/OpenXR-SDK-Source.git
cd OpenXR-SDK-Source
mkdir -p build/macos
cd build/macos
cmake -G Xcode ../..
```

然后从生成的 Xcode 项目中构建 `hello_xr` 示例目标。

Khronos 参考资料：

- [`OpenXR-SDK-Source`](https://github.com/KhronosGroup/OpenXR-SDK-Source)
- [`OpenXR-SDK` macOS 构建说明](https://github.com/KhronosGroup/OpenXR-SDK)

### 6. 从同一个 shell 运行 `hello_xr`

这一点很重要，因为示例启动时，shell 中仍需设置 `XR_RUNTIME_JSON`。

第一次应从步骤 2 使用的同一个终端会话启动，不要通过 Finder、Spotlight 或另一个 shell 窗口启动。

## 怎样才算成功

最低成功标准是：

- `hello_xr` 不会在发现运行时这一步立即失败
- Quest 客户端建立连接，而不是停在待机或加载颜色画面
- 会话创建成功
- 头显运动能影响示例的运行，而不是还没呈现画面就失败

项目本身提醒，目前 Quest 界面仍然很简陋，所以即使“能用”，看起来也可能很粗糙。

## 实际跑通了什么

我确实用本地构建的 [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) 运行时和侧载的 Quest 客户端，执行了这次测试。

在 `macOS` 上有效的 `hello_xr` 调用是：

```bash
XR_RUNTIME_JSON=~/Source/Forks/fork-OpenXR-OSX/build/runtime/openxr_osx.json \
~/Source/Forks/OpenXR-SDK-Source/build/macos/src/tests/hello_xr/Debug/hello_xr \
  -g Metal
```

`-g Metal` 很重要。不指定图形后端，`hello_xr` 只会打印使用说明，然后退出。

Quest 客户端最初显示文档描述的蓝色待机画面。`hello_xr` 启动真正的 `OpenXR` 会话后，头显连接到主机，从待机进入实际的 `hello_xr` 场景。

我在头显中看到的画面符合示例预期：青绿色背景，加上几个简单的 3D 立方体。这足以算作原生 `macOS -> OpenXR-OSX -> Quest` 路径成功。

这是那次成功运行的短视频：

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/slwVUBdZR1Y"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    title="从 macOS 在 Quest 上运行 OpenXR-OSX hello_xr"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

## 主机端证据

成功运行时，最有用的主机日志是：

- `StreamingServer: Broadcasting on ...`
- `OpenXR OSX: Streaming server started, waiting for headset connection...`
- `OpenXR OSX: Client connected (Quest), receiving tracking`
- `StreamingServer: Client connected: Quest (... ) refresh=72Hz`
- `VideoEncoder: Initialized H.265 encoder ... @ 72fps`

这确认了完整链路：

- 原生 `macOS` `hello_xr`
- `OpenXR-OSX` 运行时协商
- 创建 `Metal` 会话
- 通过局域网发现 Quest
- 跟踪数据回传主机
- H.265 视频编码
- 视频帧进入头显串流路径的队列

实际运行也让我更清楚一个有用的架构细节：`StreamingServer` 是 `OpenXR-OSX` 运行时的一部分，不是独立应用，也不属于 `hello_xr` 本身。`hello_xr` 只是一个普通的 `OpenXR` 应用。它通过运行时启动真正的会话后，`OpenXR-OSX` 就会为 Quest 客户端启动自己的发现、跟踪和视频串流流程。

## 成功运行时的性能记录

这次成功运行在头显端协商到了 `72Hz`。

主机和 Quest 的实时日志中，有用的数据如下：

- 协商刷新率：`72Hz`
- 编码器目标：`72fps`
- Quest 端解码耗时：约 `10-12ms`
- Quest 端合成器耗时：约 `1ms`
- Quest 端从接收到提交的总耗时：约 `11-13ms`
- 渲染姿态匹配率：通常为 `98-100%`

串流足够稳定，能持续较长时间显示示例场景，但并非毫无问题：

- 偶尔出现 `NACK` 重传
- 偶尔请求关键帧
- 早期出现一次编码丢帧
- 较长时间运行中，自适应码率从初始 `50Mbps` 逐步降到略高于 `30Mbps` 的范围

我不认为这些丢帧本身足以对运行时下定论。测试网络并未专门为低延迟无线串流做细致配置，因此，看到画面不时不稳定，以及部分重传和关键帧请求时，应把这个限制考虑进去。

## 90Hz 复测

后来，我修改了 Quest 客户端，让它使用 `XR_FB_display_refresh_rate`，支持时请求 `90Hz`，并记录协商结果。

复测成功了：

- Quest 客户端报告服务器为 `90Hz`
- Quest 客户端发送了 `ClientConnect ... (refresh=90Hz)`
- 主机记录 `Client connected: Quest ... refresh=90Hz`
- 编码器以 `90fps` 初始化

所以，90Hz 确实跑起来了，并不只是主机端的假设。

在 `90Hz` 下，日志仍有一些重传、关键帧请求和跳帧，但相同的网络限制依然存在：这不是严格受控的无线测试环境。因此，正确结论是 `90Hz` 得到了支持并且能工作，而不能认定串流质量的限制完全来自运行时。

所以，目前的结果还不是“生产级 PCVR”，但已经完全足以证明这套架构在自身设定的范围内可以工作，包括成功的 `90Hz` 路径。

## 过程中发现的实际陷阱

- 桌面版 `hello_xr` 需要明确指定图形后端；这里使用 `-g Metal`。
- 非交互式运行 `hello_xr`，可能会让它在打印 `Press any key to shutdown...` 后立即结束，因此测试连接最好使用真实的交互终端会话。
- Quest 客户端确实会记录有用的解码和网络统计，但最清楚的连接确认来自主机运行时日志。
- 无线 `adb` 可以正常安装和启动，因此完成配对后，不必使用 USB。

## 出错时的排查顺序

如果出了问题，我会按这个顺序检查：

1. 运行时构建产物确实存在
2. `XR_RUNTIME_JSON` 指向正确的 `openxr_osx.json`
3. Quest APK 确实安装成功
4. 头显应用已经打开，头显保持唤醒
5. Mac 和 Quest 在同一个网络中互相可达
6. 然后才开始阅读运行时或示例日志

## 为什么继续桥接之前，我想先做这个

`CrossOver` 笔记已经表明，Windows 端能走到运行时边界，但桥接问题远比原生路径困难。

如果 `OpenXR-OSX` 连原生 macOS `hello_xr` 都无法接到 Quest 客户端上，那就去尝试把 `Elite`、`OpenComposite` 和自定义运行时适配层导向它，顺序就反了。

## 结论

这是合适的第一项测试，因为它把问题缩减到项目目前声称支持的最小架构：原生 `macOS` `OpenXR` 应用、`OpenXR-OSX` 运行时，以及 Quest Android 客户端。
