---
title: "理解 Zig：现代系统编程语言与工具链"
date: 2026-03-11
tags:
  - zig
  - systems-programming
  - compilers
  - tooling
excerpt: |
  对 Zig 的实用概览：从取代 C 的目标和 LLVM 后端，到工具链设计、交叉编译模型，以及它对系统软件和 CLI 工具的吸引力。
---

> **编者注：** 本文初稿由 AI 辅助完成，具体来自一次与 ChatGPT 的对话，随后用 Claude 校订事实准确性。如果发现错误或过时内容，请留言告诉我。我不是 Zig 专家，而这门语言也仍在积极演进。

过去几年，**Zig** 在系统编程圈中越来越受关注。人们常将它称为 **C 的现代替代品**，但这门语言及其生态实际希望解决的问题更广：简化系统编程工具链、改进交叉编译，以及让开发者明确控制性能和并发。

本文概述 Zig 是什么、如何工作、与 Swift 等语言有何区别，以及它为什么在基础设施和系统工具领域受到青睐。

[[toc]]

## Zig 是什么？

Zig 是 **Andrew Kelley** 在 2016 年前后创建的系统编程语言。设计目标包括：

- **接近 C 的性能**
- **显式内存管理**
- **尽量低的语言复杂度**
- **没有隐藏的控制流**
- **现代化的集成工具链**

Zig 的理念是，让程序员**完全掌控程序行为**，同时去掉 C 生态几十年来积累的复杂性。

一种常见描述是：

```
C++
↓ remove complexity
C
↓ modernize
Zig
```

不过，这种说法稍微低估了 Zig。`comptime` 和结构化错误处理等特性，赋予了它明显超出 C 的能力。它不只是简化，更是一种重新思考。

Zig 并不试图取代 Rust 或 Go 这样的语言。它公开表述的目标更具体：

> 取代 C，成为编写系统软件的主要语言。

## Zig 与 LLVM

Zig 使用 **LLVM** 作为后端编译器基础设施。

编译流水线大致如下：

```
Zig source code
↓
Zig frontend (parsing + semantic analysis)
↓
LLVM IR
↓
LLVM backend
↓
Machine code
```

这与其他一些语言类似，例如：

- Swift
- Rust
- C/C++（通过 Clang）

但共同使用 LLVM，**不代表**编译器可以互换。LLVM 只负责生成优化后的机器码，每门语言仍需要自己的**前端和运行时语义**。

例如：

| 语言 | 运行时 |
| -------- | ------- |
| Swift | ARC 内存管理 + 并发运行时 |
| Rust | 极简运行时 |
| Zig | 几乎没有运行时 |

Zig 有意将运行时保持得极小。

## Zig 作为完整工具链

Zig 最有雄心的目标之一，是简化碎片化的系统构建生态。

传统 C/C++ 开发往往需要多个工具：

```
compiler      → gcc / clang
linker        → ld / lld
build system  → make / cmake
package mgr   → vcpkg / conan
cross toolchains → custom installations
```

Zig 试图把其中大部分收拢到**单个可执行文件**中：

```
zig
```

命令示例：

```bash
zig build
zig build-exe main.zig
zig cc main.c
```

Zig 编译器同时充当：

- 编译器
- 链接器驱动
- 构建系统
- 交叉编译管理器

## 内置交叉编译

Zig 最实用的特性之一，是**轻松的交叉编译**。

Zig 发行包包含：

- LLVM
- Clang
- libc 变体
- 各平台 sysroot

因此，开发者可以在同一台机器上为多个平台编译。

例如：

```bash
zig build-exe main.zig -target x86_64-linux
zig build-exe main.zig -target aarch64-macos
zig build-exe main.zig -target x86_64-windows
```

无需另行安装工具链或 SDK。

单凭这一点，许多开发者即使不写 Zig 代码，也会**仅把 Zig 当作编译器驱动**来使用。

## 用 Zig 编译 C

Zig 可以直接编译 C 程序。

例如：

```bash
zig cc hello.c
```

内部流程大致是：

```
Zig compiler driver
    ↓
Clang frontend (parsing C)
    ↓
LLVM backend
```

Zig 内嵌 Clang，并自动管理交叉编译工具链。

因此，许多项目将 Zig 用作 **gcc/clang 工具链的便携替代方案**。

不过，Zig 不能编译 Swift 等任意语言，因为它没有包含这些语言的前端或运行时。

## Zig 与 Swift：编译与运行时

Zig 和 Swift 都使用 LLVM，但设计差异很大。

| 特性 | Zig | Swift |
| ------- | --- | ----- |
| 编译器后端 | LLVM | LLVM |
| 运行时 | 极简 | 较为庞大的运行时 |
| 内存模型 | 手动 | ARC |
| 并发 | std.Io（见下文） | 结构化并发 |
| 任务调度 | 用户定义或 std.Io 实现 | 由运行时管理 |

Swift 提供高层运行时，包括：

- 结构化并发
- actor
- 任务调度
- 自动引用计数

Zig 有意避免把这些抽象内置进语言本身。

## Zig 中的并发

### 线程

Zig 提供对操作系统线程的直接访问：

```zig
const std = @import("std");

fn worker() void {
    std.debug.print("hello from thread\n", .{});
}

pub fn main() !void {
    var thread = try std.Thread.spawn(.{}, worker, .{});
    thread.join();
}
```

在 Linux/macOS 上，它直接映射到 POSIX 线程；在 Windows 上则映射到 Windows 线程。

### 异步 I/O：新模型

Zig 的异步方案经历了很大变化。旧的基于协程的 `async`/`await` 语法于 2024 年从语言中移除；新模型 `std.Io` 在 2025 年末落地，计划进入 Zig 0.16.0。

这个新设计值得了解，因为它很好地体现了 Zig 的理念。

核心想法是把 I/O 抽象到 `std.Io` 接口背后，就像内存分配被抽象到 `std.mem.Allocator` 背后一样。在 `main()` 中设置一次 I/O 实现，再把它传递到整个应用：

```zig
var threaded: std.Io.Threaded = .init(gpa);
defer threaded.deinit();
const io = threaded.io();
```

随后这样表达异步工作：

```zig
var a = io.async(doWork, .{ io, "task a" });
var b = io.async(doWork, .{ io, "task b" });

a.await(io);
b.await(io);
```

`io.async` 将函数的*调用*与*返回*分离。新模型也明确区分了**异步**和**并发**：

- `io.async`：表达工作可以重叠，但不保证并行执行
- `io.concurrent`：明确请求并发执行，可能返回 `error.ConcurrencyUnavailable`

这个区别很重要。在单线程 I/O 后端上，如果异步任务预期能与另一个任务并行，就可能死锁；`io.concurrent` 将这一要求明确表达出来，并允许它失败。

取消也是一等机制，设计上能与 Zig 的 `defer` 自然配合：

```zig
var a = io.async(doWork, .{ gpa, io, "task a" });
defer a.cancel(io) catch {};
```

这意味着，如果错误导致提前返回，尚未完成的任务会自动清理。

`std.Io` 接口仍在演进，IoUring 和 KQueue 后端还在开发中，但设计方向已经明确：Zig 的异步 I/O 保持**显式且可组合**，调度器由应用层选择，而不是固定在语言运行时里。

## 为什么系统工程师偏爱这种模型

高性能系统通常需要严格控制调度。

例如：

- 数据库
- 网络服务器
- 游戏引擎
- 交易系统

这些系统常采用这样的架构：

```
N CPU cores
    ↓
N worker threads
    ↓
each thread owns a work queue
```

目标是避免：

- 锁
- 跨线程通信
- 不可预测的调度

通用运行时可能自动在线程之间迁移任务，破坏性能保证。Zig 的 `std.Io` 模型让开发者明确选择和配置 I/O 实现，进而为自身系统定制调度策略，不必绕着运行时的假设工作。

## 用 Zig 构建的真实系统

一些实际使用 Zig 编写的项目包括：

- Bun JavaScript 运行时
- Ghostty 终端
- TigerBeetle 分布式数据库

这些系统受益于：

- 可预测的性能
- 显式调度
- 对内存的精细控制

## 为什么 Zig 受 CLI 工具开发者欢迎

Zig 在命令行工具领域也越来越受欢迎。有几个特点让它很适合 CLI 开发。

### 小体积二进制

Zig 能生成非常小的静态二进制。粗略来说，Zig 二进制通常只有几 MB，往往比功能相当的 Go 或 Rust 二进制更小，不过实际大小会随构建设置和包含的内容而显著变化。

### 启动快

由于 Zig：

- 没有垃圾回收器
- 运行时极简
- 初始化工作极少

程序几乎能立即启动，非常适合运行时间短的 CLI 工具。

### 易于分发

Zig 很容易生成单个静态二进制：

```
mytool-linux
mytool-macos
mytool-windows.exe
```

不需要外部依赖。

## 编译时执行（`comptime`）

Zig 有一个强大特性叫 **comptime**：程序的一部分可以在编译期间运行。

```zig
fn add(comptime T: type, a: T, b: T) T {
    return a + b;
}
```

它支持泛型、编译时校验、代码生成和反射。但 `comptime` 值得关注的，不只是它能做什么，更是它*如何*做到。

C++ 等语言通过模板实现类似结果，那是一套独立的编译时小语言，语法以复杂著称。Rust 使用过程宏，本质上是独立程序。Zig 的 `comptime` 用一个机制取代了这些：**在编译时运行普通 Zig 代码**。无需另学语法，没有宏系统，也没有模板特化规则。运行时代码和编译时代码，用的是同一门语言。

这是 Zig 对语言设计最有新意的贡献之一。

## Zig 作为现代系统工具链

Zig 最具雄心的部分，不只是语言本身，而是试图让**整个系统编程工具链**现代化。

传统 C 生态积累了几十年的复杂性：

```
gcc
make
autotools
cmake
pkg-config
custom cross compilers
```

Zig 试图将它们简化为单个统一工具：

```
zig
```

## 最后的想法

在编程语言版图中，Zig 处于一个有趣的位置：

```
Swift → application systems language
Rust  → safe systems language
Zig   → modern C replacement
```

它没有直接与高层语言竞争，而是专注于改善**系统编程的基础**：更简单的工具链、显式控制、可复现构建和便携编译。

这门语言仍在成熟，仅异步 I/O 就已经历多轮设计迭代，但方向始终一致。它最终能否取代 C，仍有待观察；不过，它已经在改变开发者思考系统编程工具链的方式。
