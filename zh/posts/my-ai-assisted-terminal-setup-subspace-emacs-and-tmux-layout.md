---
title: "我的 AI 辅助终端配置：Subspace Emacs 和 Tmux 布局快捷键"
date: 2026-05-22
tags:
  - tmux
  - emacs
  - dotfiles
  - workflow
  - terminal
  - ai
excerpt: |
  两个项目合在一起：一套真正由我掌控的轻量 Emacs 配置 Subspace Emacs，以及一个按一下键就能调出、重新安排的 tmux 70/20/10 纵向布局。它们都是与 Claude 和 Codex 合作完成的。
---

我一直在迭代一套开发工作流，让三样东西同时运行：一个 AI agent，Codex 或 Claude；一个 git 客户端；以及 `npm run dev` 这类长期运行的进程。想让这套配置用起来顺手，需要解决两个独立的问题：构建一套真正由我掌控的轻量 Emacs 配置，以及一个按一下键就能调出的固定 tmux 布局。

这篇文章介绍两者。它们彼此独立，但出发点相同：留下值得付出成本的部分，把不值得的重新做。

[[toc]]

## 工作流

目标是将一个终端窗口按 70/20/10 的比例分成上下排列的三个窗格：

- **上面 70%** 是主要工作区，运行 AI 编程 agent，例如 Codex、Claude Code，或者我当时正在用的其他工具。
- **中间 20%** 放 Magit，也就是 Emacs 的 git 客户端。空间足以暂存代码块、查看差异，又不会觉得拥挤。
- **下面 10%** 放长期运行的进程，通常是博客的 `npm run dev` 或 `npm run prod`。大多数时候它只是背景动静，但我希望看得见。

<img alt="终端窗口按 70/20/10 纵向堆叠：上方是 Codex，中间是 Magit，底部是 npm 开发服务器" src="/assets/images/posts/vertical-tri-split-tmux-workflow/vertical-tri-split.jpg" style="display: block; margin: 0 auto; max-height: 600px; width: auto; max-width: 100%;" />

多数时候，我不会同时看三个窗格。Tmux 的缩放功能 `prefix + z` 能让一个窗格占满屏幕，我还用双前缀组合键在上面两个窗格之间切换，也就是按两次 `Ctrl+B`。因为实在太常用，我干脆把它绑定到了双前缀。这个布局真正的意义，是所有东西都只隔一次缩放操作，而不是始终全部显示在屏幕上。

|     |     |
| --- | --- |
| <img alt="顶部窗格中的 Codex 放大至全屏" src="/assets/images/posts/vertical-tri-split-tmux-workflow/fullscreen-codex.jpg" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;" /> | <img alt="Subspace Emacs 中的 Magit 被换到主位置后放大至全屏" src="/assets/images/posts/vertical-tri-split-tmux-workflow/fullscreen-emacs.jpg" style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;" /> |

<figcaption style="text-align: center;"><em>放大后的 Codex（左）；交换位置后放大的 Magit（右）。</em></figcaption>

## 第一部分：tmux 70/20/10 布局

我想要两个快捷键。一个从任何单窗格窗口出发，一键创建 70/20/10 布局；另一个交换顶部和中间的窗格，同时保持比例不变，这样专心处理提交时就能把 Magit 换到主要位置。

Claude 做了最初的研究，确定了合适的架构，Codex 接手实现。过程中最有价值的成果，是一套基于 tmux 的 TDD 循环：我们没有直接编辑 `~/.tmux.conf`，然后在正在使用的会话里反复试，而是把分离运行的 `tmux new-session -d` 实例作为测试环境，用 `tmux list-panes` 和 `tmux show-options` 验证候选命令。这样一来，原先 `if-shell` 包装层的失效原因就很明显了，快捷键逻辑最终全部迁到了带保护条件的 `run-shell` 中。

真正的转折来自另一个问题：`swap-pane` 会丢失缩放状态。每次交换都会退出窗口缩放，破坏了整个快捷操作的体验。深入阅读 [tmux/tmux#1839](https://github.com/tmux/tmux/issues/1839) 后才找到解法。讨论中说明了具体模式：根据 `#{window_zoomed_flag}` 分支处理，并在 `swap-pane` 和 `select-pane` 上都使用 `-Z`，保留缩放。没有这个 issue，我恐怕还会一直猜各种标志组合。

快捷键的完整说明、`if-shell` 与 `run-shell` 的失效差异、`@stack702010` 窗口标记、操作体验调整，以及最终配置，都在配套笔记里：[Tmux 70/20/10 布局快捷键](/zh/notes/tmux-70-20-10-layout-shortcuts/)。

## 第二部分：Subspace Emacs

我把它叫作“Subspace Emacs”。我的博客模板叫 Subspace Builder，而我正在离开的完整框架叫 [Spacemacs](https://www.spacemacs.org/)，所以名字很自然就有了。

如果你没接触过：Spacemacs 是一个社区驱动的 Emacs 发行版，将 Emacs 和 Vim 融为一体。模态编辑来自 Evil，也就是 Vim 模拟层；整个交互围绕 Space 前导键组织，用容易发现、便于记忆的按键菜单呈现。它把精选软件包组织成“层”，让你能直接启用 Git、语言支持、项目管理等整套工具链，不用自己逐一接线。

Spacemacs 给了我很多喜欢的东西：Evil、带 Evil 键位的 Magit、Space 前导键，以及多年积累的肌肉记忆。但它也带来了很多我无法掌控的机制，更新又总会弄坏某些东西，迫使我调试并非自己编写的框架内部逻辑。我不想再维护别人的框架了。我想要一套足够小的配置，出了问题就知道该去哪里找，因为每一行都是我写的。

关键决定是彻底重建，而不是改造旧配置。旧配置归档，在 `~/.emacs.d` 中从零搭建新配置，`lisp/` 下采用简单的模块结构。以 leader 键为核心的体验，包括 Evil、Magit、`which-key`、`general` 和真正重要的快捷键，都经过有意选择后移植，没有整套照搬。中途也遇到了一些麻烦的小问题，比如启动闪屏、Helm 文件选择器的行为、Magit 返回缓冲区、自定义模式行，都写在配套笔记里了。

有价值的结果不只是“一套自定义 Emacs 配置”，而是一套小到能理解、完善到用着舒服、熟悉到能保留旧习惯，又灵活到可以继续演进而不受框架拖累的配置。

迁移过程、模块布局、保留的快捷键和棘手部分的完整记录，在配套文章中：[从 Spacemacs 走向轻量 Emacs](/zh/posts/lightweight-emacs-from-spacemacs/)。

## 贯穿两者的思路

两个项目的协作方式一样：Claude 或 GPT 做研究和实现，我提供错误日志、使用反馈和方向。它们都不要求我是 tmux 内部机制或 Emacs 启动顺序的专家，需要的是清楚自己想要什么，并能描述哪里感觉不对。

以分离会话作为测试环境、而不是手动折腾实时配置的 tmux TDD 方法，可能是这次最有价值的一项技巧。它值得推广：把 tmux 当作可以探测、可以断言验证的系统。只要定制比简单的键绑定复杂，这个思路就用得上。
