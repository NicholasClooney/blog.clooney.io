---
title: "我的超能 Tmux：一个会话，多个独立焦点"
date: 2025-10-14
tags:
  - tmux
  - cli
  - macos
  - workflow
social:
  linkedin-post:
    status: shared
    lastShared: 2025-10-29T16:58:13.076Z
  linkedin-article:
    status: shared
    lastShared: 2025-10-29T16:58:19.231Z
---

## 简要说明

- 我在 MacBook Pro 上一直运行着一个“主” tmux 会话。
- 每台设备，包括 MacBook Air、iPad、iPhone，都连接到同一组窗格。
- 借助 tmux 会话组，每台设备仍然可以独立选择当前聚焦的窗口。
- 用起来就像一套随身而行的个人开发操作系统。

## 我想解决的问题

我希望 tmux 是一个完整统一、永不消失的环境。在桌前接上扩展坞时，我会把 iTerm 分布到多个 Mission Control 桌面，每个空间放一个不同的项目，以及那个项目需要的其他工具。之后拿起 MacBook Air，或者在 iPhone、iPad 上打开 Blink 时，我希望看到完全相同的窗格、命令历史和回滚内容。

普通的 `tmux attach` 已经很接近了，但共享的“当前窗口”会打破这种体验。我在主终端切换窗口，所有其他 tmux 客户端也会跳到同一个窗口，打断我正在进行的事情。我想让 tmux 既保留状态，*又*支持多个独立焦点。

[[toc]]

## Tmux 会话组派上用场

Tmux 有一个不算秘密的功能，叫作**会话组**。同组会话共享窗口，但各自保留独立的焦点。换句话说，一套统一的窗格，可以有多个独立视角。

手册（运行 `man tmux`）是这样解释的：

> 如果指定了 `-t`，新会话会与指定的会话分在同一组。同组会话共享同一组窗口。

工作流程如下：

```sh
# Start the canonical session that will own the pane layout.
tmux new-session -s main

# From any other terminal (or the same machine on a different desktop),
# create or attach to a grouped session.
tmux new-session -t main [-A] -s <client-name>
```

`-A` 标志告诉 tmux：会话已存在就连接它，否则创建一个新的同组会话。每个同组会话都有自己的焦点，因此一台设备可以停在 REPL，另一台则持续查看日志。

## 我如何组织会话

- **`main`** 在 MacBook Pro 登录时启动。它几乎从不结束，是那套统一的窗口布局。
- **设备会话**按硬件命名，例如 `air`、`iPad`、`iPhone`，连接时就加入会话组。
- **上下文会话**是为特定项目创建的组成员，例如 `subspace`、`blog`、`ansible` 等。它们让我可以把一个 Mission Control 桌面或 tmux 标签页专门留给某个关注点，不必复制窗格。

妙处在于，我可以关闭一个上下文会话，而窗格仍然活在 `main` 中。回到那个项目时，再创建同名的上下文会话，tmux 就会把焦点恢复到我离开的位置。

## 自动化入口

**Fish shell 辅助函数**

```sh
# ~/.config/fish/functions/tmux-project-session.fish
function tmux-project-session
  tmux new-session -t main -A -s (basename (pwd))
end
```

我把它设成别名 `tm`，这样只要 `cd repo && tm`，就能立刻得到一个项目专用的焦点，并共享主会话的窗格布局。

**Blink + mosh 默认配置**

Blink 允许为每台主机设置默认命令。我的配置如下：

```sh
tmux new-session -t main -A -s iPhone
```

Blink 一连接，设备就自动加入会话组。状态栏动画还没结束，我就已经看到了那套熟悉的窗格。

## 实际效果

MacBook Pro 在书房里忙着运行大型构建时，我在 iPad 上打开 Blink，加入 `main` 会话组，再把 `macmon` 留在屏幕上，就能坐在沙发上观察 CPU、内存和温度。窗格还是那些窗格，设备完全不同，上下文一点没丢。

<img
  alt="通过 tmux 和 macmon 在 iPad 上监控 MacBook"
  src="/assets/images/posts/tmux-focus/tmux-on-iPad.jpeg"
/>

回到 Mac 上，Mission Control 的每个桌面都有自己的同组会话，我可以把全屏空间专门留给某个项目。下面就是两个同组会话的样子：窗口相同，焦点各自独立。

<img
  alt="macOS 上两个焦点独立的同组 tmux 会话"
  src="/assets/images/posts/tmux-focus/tmux-on-mac.png"
/>

## 提升日常体验的小调整

- **状态栏**：我在 tmux 状态栏中加入 `#S`，让它显示 `[main]`、`[ipad]`、`[blog]` 等。扫一眼就知道当前看的是哪个焦点。
- **历史同步**：`fzf`、`zoxide` 这类工具让各会话中的 shell 历史和目录跳转保持一致。配合 tmux 会话组，每台设备都像同一个长久运行的终端。

## 你自己的开发操作系统

理解会话组之后，tmux 就像一个以远程使用为先的操作系统。我可以把一个长时间任务留在 MacBook Pro 上跑一整夜，第二天早上拿起 iPad 继续，完全不用在意最初是哪台机器启动的。试试看：保持一个 `main` 会话运行，再用 `tmux new-session -t main -s experiment` 启动第二个，看看焦点如何保持独立。加上一点脚本，它就会成为习惯，你的终端也开始拥有**超能力**。
