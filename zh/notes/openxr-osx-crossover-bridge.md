---
title: "CrossOver 中的 OpenXR 能连接 OpenXR-OSX 吗？"
date: 2026-05-22
time: "22:02"
tags:
  - vr
  - quest
  - macos
  - crossover
  - openxr
  - elite-dangerous
excerpt: |
  探讨能否把 CrossOver 中运行的 Windows OpenXR 应用桥接到 macOS 上的 OpenXR-OSX，以及为什么这会变成自定义代理运行时问题，而不是简单切换运行时。
---

这篇笔记接着[《通过 CrossOver 在 Apple silicon Mac 上使用 Quest PCVR》](/zh/notes/quest-pcvr-on-mac-notes/)和[《Virtual Desktop / CrossOver 调查记录》](/zh/notes/vd-crossover-findings/)继续。

[[toc]]

## 问题

我想把问题缩小到一个更具体的范围：

- `Elite Dangerous` 已经能在 `CrossOver` 中进入 `OpenXR` 路径
- `OpenComposite` 已经能把游戏的 `OpenVR` 调用转成 `OpenXR`
- [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) 现在宣称提供 `macOS` 上的 `OpenXR` 运行时

那么，很自然的下一问就是：

`能否将 CrossOver 中的 Windows OpenXR 应用指向 Mac 主机上的 OpenXR-OSX？`

## 简短回答

不能直接这样做。

容器里的 `Elite -> OpenComposite -> Windows OpenXR loader -> ActiveRuntime` 链条是真实存在的，但终点仍是 **Windows** 运行时边界。`OpenXR-OSX` 是 **macOS** 运行时，在主机侧提供运行时清单和一个 `dylib`。`CrossOver` 里的 Windows loader 不能像对待另一个普通运行时 JSON 那样直接使用它。

## Elite 的结果究竟证明了什么

之前的 `Elite Dangerous` 测试仍然有价值。

它说明：

- `Elite` 能进入 VR 路径
- `OpenComposite` 能截获该路径并转发到 `OpenXR`
- Windows 侧 loader 能找到 `ActiveRuntime` 并尝试启动会话

这意味着应用侧并非完全走不通。容器中的 Windows OpenXR 应用能够推进到尝试与运行时通信的阶段。

但它**没有**证明，应用已经接近与主机原生 macOS 运行时通信。

## 桥接断在哪里

### 1. loader／运行时边界仍然是 Windows

在 Windows 上，`OpenXR` loader 从注册表读取活动运行时，打开运行时 JSON，再加载 `library_path` 指向的共享库。

这一点很关键，因为 Windows 进程预期这条路径的终点是 Windows 运行时二进制。

在我们的情况下：

- 容器可以把 `ActiveRuntime` 指向 Windows JSON
- 该 JSON 应当指向 Windows 运行时库
- `OpenXR-OSX` 生成的却是 `openxr_osx.json`，指向 macOS 侧的 `libopenxr_osx.dylib`

所以，还没涉及头显追踪或帧时序，Windows 进程与 macOS 运行时就已经对“运行时二进制究竟是什么”存在分歧。

## 为什么不只是清单文件的问题

即使能用某种技巧，让 Windows 侧接受主机侧运行时目标，也仍然没有解决运行时真正的工作。

`OpenXR` 运行时不只是追踪服务。它负责或深度参与：

- 系统发现
- 设备形态选择
- 会话创建
- 交换链创建
- 图形 API 绑定
- 帧时序
- 视图位姿
- 输入空间
- 帧提交

`CrossOver` 内的应用仍是 Windows 应用，因此它的图形需求通过 Windows 侧 API 和句柄表达。而主机侧 macOS 运行时，则围绕自己的运行时实现和图形互操作路径构建。

到这里，问题就不再是切换一个开关，而像是在设计新的兼容层。

## 真正的桥接需要什么

最小的可行架构，看上去更像自定义代理运行时，而非切换运行时。

### 1. 容器内的 Windows 运行时垫片

需要一个 Windows `OpenXR` 运行时 DLL，让 Windows loader 能正常发现并加载。

它的职责是：

- 满足 Windows loader 的要求
- 暴露预期的运行时协商入口点
- 实现足够的 OpenXR 运行时接口，让应用保持运行
- 把实际工作转发到别处

### 2. 容器与主机之间的 IPC

随后，这个垫片需要把运行时调用从 Windows 进程发送到 macOS 主机侧服务。

这意味着要为以下内容设计传输协议：

- 实例和会话生命周期
- 系统查询
- action 和空间状态
- 交换链协商
- 帧时序
- 帧提交

最合理的第一版可能是：

- 用 `Unix domain socket` 处理本地控制和请求／响应流量
- 只有图像传输对普通 socket IPC 来说太重时，再引入共享内存

其他选择也存在，但不太适合作为默认方案：

- `localhost TCP` 容易观察和调试，但作为同机通信约定，没有本地 socket 那么紧密
- 一开始就用共享内存，会过早优化，在桥接尚未证明任何东西之前，就让所有权和同步更加棘手

因此，基本形态会是：

- Windows 垫片 DLL 由 `CrossOver` 内的 `OpenXR` loader 加载
- 垫片连接主机守护进程，可能使用 `/tmp/openxr-osx-bridge.sock` 这样的 socket 路径
- 运行时请求经过序列化后跨通道发送
- 主机守护进程返回转换后的结果，并维护主机侧对象状态

这也意味着原始运行时指针和句柄不应直接跨越边界。更稳妥的模型，是让桥接层定义自己的对象 ID：

- Windows 侧：伪造的 `XrInstance`、`XrSession` 和 `XrSwapchain` 句柄，由垫片侧表格支撑
- 主机侧：对应的桥接 ID，映射到真实主机对象

这样协议更接近“带句柄间接层的 RPC”，而不是“共享实现内存，然后祈祷”。

### 3. 与 OpenXR-OSX 通信的主机侧运行时服务

macOS 侧需要某个组件接收这些调用，然后：

- 直接驱动 `OpenXR-OSX`，把它当作底层运行时后端
- 或自行重新实现足够的运行时行为，让 Windows 客户端以为自己在与普通运行时通信

### 4. 图形数据封送

这是最难看的一部分。

Windows VR 应用不只是请求位姿，然后就结束了。它还通过交换链提交渲染图像。桥接必须解决：帧如何离开 `CrossOver` 内转译后的 Windows 图形世界，再以 macOS 运行时能够呈现到头显路径上的形式到达。

我预计，项目到这里会很快变得痛苦。

这里的划分很重要：

- 控制平面：基于 socket 的 RPC 路径大概就够了
- 数据平面：提交的帧图像，可能迫使桥接改变形态

作为概念验证，帧路径甚至也可以先走同一个 IPC 通道，只为证明调用顺序和对象生命周期。如果推进到能提交真实帧，我预计下一轮重设计会围绕图像传输：

- 共享内存环形缓冲区
- 显式同步原语
- macOS 侧的主机原生呈现表面

到这里，项目就从“如何把 OpenXR 调用传过去”，变成“如何以尚可承受的延迟传输 VR 帧数据”。

共享普通内存，与共享一个真正能充当渲染目标的资源，也有重要区别。

在 CPU 内存层面，原理上原生 macOS 进程和 `CrossOver`/Wine 进程应该能映射同一片共享区域：

- POSIX 共享内存
- `mmap`
- 内存映射文件

因此，桥接可以在主机分配共享内存，两侧都映射它，把它当作基于复制的传输缓冲区。

但这**不意味着**就有了干净的零复制渲染路径。

Windows 应用仍然期待与 Windows 侧图形 API 关联的 `OpenXR` 交换链图像。即使两个进程都能看到同一片 CPU 可见内存，也不自动意味着：

- 应用能高效地向其中渲染
- 转译图形栈能在正确时机把已提交图像导出到那里
- 主机无需额外复制就能使用它
- 同步和所有权规则能准确对齐，满足 VR 时序

所以，`IOSurface` 这样的主机侧对象只能回答一部分问题。像素已经存在于 macOS 侧时，它们很有用；但更早的问题仍在：已提交的帧究竟如何先从 Windows/CrossOver 图形路径中出来？

因此，可能的区别是：

- 进程之间共享内存：可行
- 跨容器／主机边界共享零复制渲染资源：可行性低得多

如果这座桥最终存在，第一版很可能不得不使用基于复制的帧传输。这或许足以验证架构，但延迟预算能否满足实际 VR，仍是悬而未决的问题。

## 更新：复用现有的 D3D 到 Metal 转译接口

上面的图形数据封送部分，假定桥接必须从头设计帧传输。其实未必如此。对于每个通过 CrossOver 运行的游戏，它已经解决了“Windows D3D 纹理变成真实 Mac 原生 GPU 资源”的问题。代理运行时恰好可以接入这个位置，而不必再平行构建一套传输。

### CrossOver 目前的三种转译层

- **D3DMetal**：Apple 的 Game Porting Toolkit，D3D11/12 直接到 Metal。闭源，无法修改，对这件事来说是死路。
- **DXVK + MoltenVK**：开源，D3D → Vulkan → Metal。在部分呈现路径中，MoltenVK 使用 IOSurface 支撑其图像。
- **DXMT**：较新、开源、原生使用 Metal 的 D3D11 实现，没有 Vulkan 中间跳转。三者中最有希望，因为既开放，又最贴近底层 Metal（不是故意玩双关）。

### 为什么这改变了问题的形态

使用 DXVK/DXMT 的应用，每次普通 `Present()` 调用都已经生成真实的主机侧 Metal 纹理。这正是原笔记遗漏的机制：转译层已经跨过了桥接所需要跨越的那个边界。

复杂之处在于，OpenXR 交换链不像普通 D3D 交换链那样由应用拥有。**运行时**创建图像，通过 `xrEnumerateSwapchainImages` 交给应用渲染。因此，处在真实 OpenXR 运行时位置的垫片 DLL 需要：

1. 通过 DXMT/DXVK 向 D3D 设备请求交换链纹理，就像任何游戏请求渲染目标一样
2. 进入转译层内部的纹理对象，取出底层 `IOSurface` 引用

### IOSurface 如何承担关键工作

`IOSurface` 是 macOS 原生机制，专为跨进程传递 GPU 内存设计。垫片一旦拿到 IOSurface ID，只需通过 IPC 发送这个 ID，不必发送像素。主机守护进程在自己这一侧调用 `IOSurfaceLookup()`，再把表面直接交给 OpenXR-OSX/Metal。

这是真正的数据平面零复制路径，而不是上一节所说的“共享内存环形缓冲区，再祈祷同步能对上”。

### 修订后的可能故障顺序

这并没有消除前面提到的 loader、会话和时序问题，只改变了帧传输的形态。桥接尝试仍可能遇到的障碍，大致重新排序如下：

1. loader／运行时协商不匹配（不变）
2. `xrGetSystem`／设备形态不匹配（不变）
3. `xrCreateSession` 图形绑定不匹配（不变）
4. 让 DXMT（或 DXVK）按垫片而非应用的要求交出交换链纹理，替代原来的“交换链／图像传输”障碍
5. 提取 IOSurface 句柄，并在转译层不发生冲突的情况下，合法地跨容器／主机边界共享
6. 时序和合成器行为（不变）
7. 延迟（不变，但可能优于基于复制的传输）

### 结论

它仍不是配置开关。但它把“发明帧传输”变成了“取出已经存在的句柄”，比原笔记里基于复制的最坏情形小了不少。前提是 DXMT 内部足够可访问，能从它创建的交换链纹理中取出 IOSurface。

## 可能的故障顺序

如果我真去构建这座桥，预计障碍会大致按以下顺序出现：

1. `xrCreateInstance` 或 loader 协商不匹配
2. `xrGetSystem` 和设备形态报告不匹配
3. 图形绑定类型无法准确对齐，导致 `xrCreateSession` 失败
4. 交换链／图像传输问题
5. 时序和合成器行为
6. 即使技术栈勉强保持运行，延迟最终仍高到无法实际使用 VR

这个排序很重要，因为它说明这不只是“把 loader 做完”的项目。loader 发现机制工作之后，更深的问题仍在后面等着。

## 为什么这仍不像一条好的 Elite 路径

对于 `Elite Dangerous`，完整技术栈会是：

- `Elite`
- `OpenComposite`
- 容器里的 Windows `OpenXR` loader
- 自定义代理运行时垫片
- IPC 桥接
- 主机侧运行时适配器
- `OpenXR-OSX`
- Quest Android 客户端

还没谈动作到画面的延迟、控制器映射、音频和长时间会话稳定性，就已经有这么多活动部件。

之前的 `Virtual Desktop` 调查已经说明，试图借用 `CrossOver` 内不受支持的 Windows 运行时栈很脆弱。这个桥接想法避开了 `Virtual Desktop Streamer`，但又换成了另一类不受支持的系统工程。

## 现在什么比较现实

[`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) 近期现实的用途，仍然像是：

- 原生 `macOS` `OpenXR` 示例
- 为 `macOS` 构建的原生 `Unity` 或 `Godot` `OpenXR` 应用
- 配合项目自己的 Quest 客户端，按其原本设计方式进行测试

这与“在 CrossOver 里运行 Windows PCVR 游戏，再接到主机运行时”很不一样。

## 结论

目前的 `Elite` 结果有趣之处在于，它证明 Windows 应用侧可以在 `CrossOver` 内到达 `OpenXR` 运行时边界。

但那个边界仍然不是我们需要的。

把 `CrossOver` 中的 Windows OpenXR 应用桥接到主机上的 `OpenXR-OSX`，需要自定义 Windows 运行时代理和主机侧适配器，图形及交换链传输很可能是最难的部分。这是一个运行时桥接项目，而不是配置练习。
