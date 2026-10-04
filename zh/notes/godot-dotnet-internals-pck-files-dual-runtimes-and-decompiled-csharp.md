---
title: "Godot + .NET 内部机制：PCK 文件、双运行时，以及反编译 C# 为什么那么难看"
date: 2026-04-24
tags:
  - godot
  - dotnet
  - modding
  - project-spire
excerpt: "理解 Godot 4 C# 游戏的一套实用思路：PCK 是 Godot 的虚拟文件系统，DLL 由 CoreCLR 执行，而反编译 C# 较难阅读，是因为从 IL 重建源码会丢失信息。"
---

*写给 Slay the Spire 2 模组作者和 Godot C# 开发者的技术深入笔记。*

## 疑问：为什么 C# 出现在两个地方？

如果解包一个 Godot 4 C# 游戏，比如 Slay the Spire 2，你会注意到一个奇怪的现象：C# 似乎同时存在于*两个*地方。

- `sts2.pck`：Godot 的资源打包归档。
- `sts2.dll`：放在可执行文件旁边的 .NET 程序集。

看起来像是重复，其实不是。它们服务于两个完全不同的使用方。

## 每个文件用来做什么

### `.pck` 文件

`.pck` 是 Godot 专用的虚拟文件系统归档，本质上像一个压缩包，装着引擎所需的一切：场景、纹理、音频、着色器，还有 C# 源文件。游戏启动时，Godot 会挂载 `.pck`，通过自己的虚拟文件路径系统（`res://`）提供对内容的访问。

这里打包的 C# 文件是供 **Godot 自身使用**的，用于工具、编辑器和资源一致性。在 Godot 4 C# 项目中，原始 `.cs` 源文件会原样打包进去。

### `.dll` 文件

`.dll` 是标准的 .NET 程序集，包含编译后的 IL 字节码，由 CoreCLR 运行时加载执行。它放在磁盘上、游戏可执行文件旁边，是因为 .NET 运行时通过**普通的操作系统文件路径**查找程序集，而不是通过 Godot 的虚拟文件系统。它不认识 `.pck` 文件。

### 整体流程

```text
Source .cs files
      |
      v (Roslyn compiler)
sts2.dll  <--- CoreCLR loads this for execution
      |
      v (bundled into)
sts2.pck  <--- Godot mounts this as its virtual filesystem
```

同一个程序集，两个使用方，两个位置。

## 并行运转的两个运行时

这部分很容易让人困惑。运行 Godot 4 C# 游戏时，**两个独立的运行时同时在工作**。

### Godot 引擎运行时

Godot 负责：

- 场景树、节点、物理和渲染。
- 自己的虚拟文件系统，`.pck` 就挂载在这里。
- 通过 `GD.Load<T>()` 和 `res://` 路径加载资源。
- 游戏主循环和信号系统。

### .NET 运行时（CoreCLR）

微软的 CoreCLR 负责：

- 实际执行编译后的 C# IL 字节码。
- 垃圾回收和内存管理。
- 程序集解析与加载。
- 类型系统和反射。

### 两者如何连接

Godot 本身不执行 C#，而是**嵌入 CoreCLR，由它承载这个运行时**，类似 Unity 嵌入 Mono 或 IL2CPP。Godot 启动时会引导 CoreCLR 启动，两侧通过名为 **GodotSharp** 的原生互操作桥接层通信。

```text
Godot Engine
    |
    |-- starts up, mounts sts2.pck
    |
    |-- initializes CoreCLR as embedded host
    |       |
    |       `-- CoreCLR loads sts2.dll from disk
    |               `-- your C# code runs here
    |
    |-- calls into C# via GodotSharp bindings
    `-- C# calls back into Godot via the same bridge
```

你的 C# 模组代码由 CoreCLR 执行，但操作的 `Node`、`Resource`、`PackedScene` 等对象属于 Godot 一侧，通过 GodotSharp 桥接层访问。任何一个运行时崩溃，整个程序都会出问题。

## 为什么从 PCK 提取的 C# 干净得多

做模组时很快就会发现：用 [gdre_tools](https://github.com/bruvzg/gdsdecomp) 从 `.pck` 提取的 C# 清晰易读；用 ILSpy 或 dnSpy 反编译 `.dll`，得到的代码却难看得多。同一个游戏，同一份代码，为什么会这样？

### `.pck` 包含什么

gdre_tools 从 `.pck` 提取 C# 时，恢复的是 Godot 自己存进去的文件。在 Godot 4 C# 项目中，**原始 `.cs` 源文件会直接打包进 `.pck`**，没有经过任何转换。拿到的内容很接近原始源码，甚至就是原始源码。

### `.dll` 包含什么

`.dll` 包含编译后的 **IL 字节码**。源码已经经过 Roslyn 编译器处理；如果是 Release 构建，还经过优化器处理：

```text
.cs source
    |
    v Roslyn compiler
IL bytecode + metadata
    |
    v Release optimizations
    |-- method inlining
    |-- dead code elimination
    `-- local variable merging
         |
         v
    stored in .dll
```

把它交给反编译器时，反编译器做的是**逆向工程**，也就是从 IL 重建 C#。这个过程本来就会丢失信息：

| 丢失的内容 | 反编译输出中的结果 |
|---|---|
| 变量名 | `local_0`、`V_3`、`b__4` |
| 注释 | 完全消失 |
| Lambda / 闭包 | 展开成生成的类（`<>c__DisplayClass`） |
| LINQ 表达式 | 展开成状态机 |
| Async/await | 显式的状态机结构体 |
| 编译器提示 | 全部显式呈现，显得很难看 |

### 一眼看懂

| | 从 `.pck` 提取 | 反编译 `.dll` |
|---|---|---|
| 来源 | Godot 打包的原始 `.cs` | IL → 重建的 C# |
| 变量名 | 原本写下的真实名称 | 丢失或被改写 |
| 注释 | 保留 | 消失 |
| Lambda | 简洁的一行表达式 | 难看的生成类 |
| 异步方法 | 清晰 | 显式状态机 |
| 准确性 | 原始源码 | 近似重建 |

## 给模组作者的实用建议

逆向 Godot C# 游戏时，`.pck` 是**首要目标**。gdre_tools 可以直接从中提取清晰、可读、接近原始版本的源码。

反编译 `.dll` 是**后备方案**：当某些内容没有打包进 `.pck`，或者你需要在 IL 层面核实实际执行的内容时，它很有用。但对于一般的模组开发和游戏逻辑理解，每次都应该先从提取 `.pck` 开始。

## 文中提到的工具

- **[gdre_tools / gdsdecomp](https://github.com/bruvzg/gdsdecomp)**：提取 `.pck` 的合适工具；支持 Godot 3 和 4，能从编译后的 `.gdc` 字节码恢复 GDScript，也能从 `.pck` 提取 C# 源码。
- **ILSpy / dnSpy**：.NET 反编译器，用于在 IL 层面检查 `.dll`。
- **GodotSharp**：连接 Godot 与 .NET 运行时的原生互操作桥接层。
