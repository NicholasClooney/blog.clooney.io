---
title: "安全地配置 Rust，不再盲目执行 `curl | sh`"
date: 2025-10-12
tags:
  - rust
  - security
  - macos
  - cli
  - devops
  - infra
---

## 1. 引言

Rust 是这个时代设计最用心的语言之一，但在 macOS 上安装它，却莫名让人摸不着头脑。常见建议是运行 `curl https://sh.rustup.rs | sh` 这样的一行命令。它确实很好用，却隐藏了许多幕后过程。对于更重视安全，或只是想知道装了什么、装在哪儿的开发者来说，这种默认方式很像一个黑箱。

这篇文章会介绍在 macOS 上安装和管理 Rust 的不同方法：Homebrew 的便利、rustup 的灵活，以及手动安装或容器环境的透明度。目标很简单：在保留实用性的同时，让你了解过程并掌握控制权。

[[toc]]

---

## 2. 快速比较安装方法

| 方法 | 优点 | 缺点 | 适合谁 |
|---|---|---|---|
| **Homebrew（`brew install rust`）** | 系统包管理器管理，简单 | 只有一个版本，更新较慢 | 只需要全局稳定版 Rust 的用户 |
| **rustup（官方脚本）** | 多工具链、按项目固定版本、可复现 | 需要把脚本通过管道交给 shell | 大多数 Rust 开发者，在信任基础上追求便利 |
| **通过 Homebrew 安装 rustup（`brew install rustup-init`）** | 拥有 rustup 的全部能力，可通过 Brew 审核 | 手动配置略多 | 希望兼顾灵活与安全的人 |
| **手动安装** | 完全透明，可以验证签名 | 复杂，维护较多 | 高级用户或高安全要求的环境 |
| **Docker / Vagrant** | 完全隔离，环境可复现 | macOS 上 I/O 较慢，无法构建 macOS/iOS 二进制 | 可复现的 Linux 构建或类似 CI 的开发环境 |

如果拿不定主意，**用 `brew install rustup-init`**：既能获得 rustup 的全部功能，也能通过 Homebrew 审核安装过程。

---

## 3. 常见的 Rust 安装方式

运行：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

会下载官方 rustup 安装脚本，并在 shell 中执行。脚本检测平台，下载预编译的 `rustup-init` 二进制文件，再把它和默认工具链（通常是 `stable-x86_64-apple-darwin`）一起安装到 `~/.cargo/bin`。

这是官方支持的方式：Rust 团队维护基础设施，使用 HTTPS，并发布带签名的清单。不过，你看不到底层发生了什么；对一些人来说，这就足够让他们先停下来想一想。

---

## 4. Brew 替代方案

通过 Homebrew 安装 Rust 很简单：

```bash
brew install rust
```

Homebrew 负责下载、校验和验证，并安装到 `/usr/local/Cellar/rust`，Apple Silicon 上则是 `/opt/homebrew`。你会得到 `rustc`、`cargo` 和标准工具，它们都链接到 `/usr/local/bin`。

**优点：**更新由包管理器处理，管理归属清晰，与系统包管理集成。

**缺点：**只有一个版本，更新落后于官方发布，也不方便安装 nightly 或 beta 工具链。如果多个 Rust 项目依赖不同版本，很快就会觉得麻烦。

---

## 5. 我偏好的方式

如果你不喜欢直接运行网上的 shell 脚本，又想方便地管理版本、组件和目标平台……

可以直接通过 Homebrew 安装 `rustup`：

```bash
brew install rustup
```

装的是同一个工具，但走的是可信、可审核的渠道。

### 深入理解 rustup

`rustup` 不是编译器，而是*工具链管理器*。它在 `~/.rustup` 下管理版本、组件和目标平台，而编译器和工具本身位于 `~/.cargo/bin` 下。

使用 rustup，你可以运行：

```bash
rustup install stable
```

它会安装 cargo、clippy、rust-docs、rust-std、rustc、rustfmt，并把默认工具链设为 'stable-aarch64-apple-darwin'。

你甚至可以通过 `rust-toolchain.toml` 或 `rustup override set` 为每个项目固定版本。更新命令 `rustup update` 会从 Rust 的 CDN 获取带签名的清单。这套方式安全，而且可复现。

---

## 6. 容器中的 Rust：Docker 与 Vagrant

如果你想与宿主系统完全隔离，Rust 在 Docker 或由 Vagrant 管理的容器中也能很好地运行：

```bash
docker run --rm -it \
  -v "$PWD":/workspace \
  -w /workspace rust:1-bookworm bash
```

你可以构建项目，用命名卷缓存依赖，让宿主系统保持干净。

**优点：**环境干净、可复现，不污染系统，也容易与 CI 保持一致。

**缺点：**macOS 上 Docker 的文件系统性能可能较慢，而且无法从 Linux 容器交叉编译 macOS/iOS 二进制。

如果想进一步提高可复现性，可以用 Vagrant 包装 Docker，定义开发环境。不过除非是在搭建大型多人开发环境，否则通常有些过度。

---

## 7. 安全与信任

归根结底，安装 Rust 取决于**你信任谁**：

* **Homebrew：**信任 Homebrew 维护者及其预编译包 bottles。
* **rustup：**信任 Rust 项目的官方分发基础设施。
* **Docker：**信任你选择的 Rust Docker 镜像的维护者。

想更放心一些，可以：

* 通过 Brew 安装 `rustup`，不使用 `curl | sh`。
* 在 Docker 容器内使用非 root 用户。
* 手动下载时验证签名。
* 使用 [`cargo-vet`](https://github.com/mozilla/cargo-vet) 或 [`cargo-crev`](https://github.com/crev-dev/cargo-crev) 审核依赖。

---

## 8. 实用建议

- **追求简单：**`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`。
- **兼顾控制与便利：**`brew install rustup`。
- **追求隔离：**Docker，加上用于 cargo 的命名卷。

对大多数 macOS 开发者来说，一个不错的折中方案是：

```bash
brew install rustup
rustup default stable
# Make sure to add the `rustup/bin` path to your shell's PATH env variable
```

这套配置可审核、可复现，而且能配合所有主流工具使用，包括 VS Code、Rust Analyzer 等。

---

## 9. 最后的想法

安全地配置 Rust，并不意味着必须牺牲便利。关键在于**心里有数**：了解安装了什么、文件放在哪里，以及自己信任的是谁。

Rust 生态围绕可复现性和安全性设计，其工具也延续了这一点。无论你喜欢完全容器化的环境、手动验证的二进制，还是标准 rustup 工作流，重要的是做出知情的选择。

毕竟，安全不只是对脚本说*不*，而是清楚知道它们在做什么。
