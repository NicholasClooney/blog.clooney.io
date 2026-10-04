---
title: "离开 Spacemacs 后，搭建一套轻量 Emacs 配置"
date: 2026-05-22
tags:
  - emacs
  - dotfiles
  - workflow
excerpt: "从 Spacemacs 迁移到小得多的手工 Emacs 配置：保留什么，移除什么，以及新配置如何实现。"
---

最近，我从 Spacemacs 迁移到了一套小得多、自己搭建的 Emacs 配置。目标并不是抛弃 Spacemacs 的使用体验，而是保留真正有价值的部分，去掉那些让编辑器像一整套操作系统的东西。

这篇文章记录我保留了什么、移除了什么，以及新配置的实现方式。

[[toc]]

## 为什么离开 Spacemacs？

Spacemacs 做得太多了。

它提供了一些我很喜欢的东西：

- 通过 `evil` 实现非常扎实的 Vim 模拟。
- 带 Evil 键位的 Magit。
- Space 前导键和方便发现功能的按键菜单。
- 已经形成肌肉记忆的键位，例如：
  - `SPC f s` 保存文件。
  - `SPC q q` 退出。
  - `SPC g g` 打开 Magit。

但也带来了许多框架机制：

- layer。
- 启动抽象。
- 包编排。
- 我无法完全掌控的界面约定。
- 很多我其实不需要的内置行为。

解决办法不是继续用力调整 Spacemacs，而是围绕自己想要的交互方式，搭一套更小的配置。

## 迁移策略

关键决定是把它当成一次从头重建，而不是转换。

旧配置保留在：

- `~/.emacs.d.spacemacs-2026-05-22`
- `~/.archive/.spacemacs.d`

然后在 `~/.emacs.d` 中从零搭建新配置。

这种分离很重要，它让我可以：

- 安全归档旧框架。
- 需要时检查旧配置的行为。
- 有选择地迁移思路，而不把框架的假设一并带过来。

我还添加了另一个启动器，仍可用下面的方式打开归档的 Spacemacs：

```sh
~/.bin/emacs-spacemacs
```

这个启动器使用 Emacs 的 `--init-directory`，无需来回交换目录。

## 设计原则

新配置遵循几条严格规则：

- `init.el` 始终是真正的入口。
- `early-init.el` 只处理必须提早执行的启动工作。
- 模块放在 `lisp/` 下。
- 有意控制包的数量。
- 迁移的是行为，而不是复制框架代码。

结果是配置更容易阅读、调试，也更容易放心扩展。

## 新配置保留了什么

新配置保留了让 Spacemacs 用起来舒服的交互模式：

- `evil`
- `evil-collection`
- `general`
- `which-key`
- `magit`

沿用的键位包括：

- `SPC SPC` 执行 `M-x`。
- `SPC f f` 查找 Git 跟踪的文件。
- `SPC f F` 常规文件搜索。
- `SPC f s` 保存。
- `SPC f e d` 打开 `init.el`。
- `SPC f e r` 重新加载配置。
- `SPC g g` 打开 Magit。
- `SPC q q` 退出 Emacs。
- `SPC 0` 关闭其他窗口。
- `SPC 1` 关闭当前窗口。
- `SPC 9` 禅模式。

这些就是体验的核心。它们恢复后，新配置马上就有了熟悉的感觉。

## 模块布局

配置刻意保持扁平、明确：

```text
~/.emacs.d/
├── early-init.el
├── init.el
├── custom.el
└── lisp/
    ├── bootstrap.el
    ├── completion.el
    ├── core.el
    ├── docs.el
    ├── evil-setup.el
    ├── git-setup.el
    ├── keys.el
    ├── languages.el
    ├── modeline.el
    ├── theme.el
    ├── ui.el
    └── vendor/
        └── spacemacs-theme/
```

每个文件负责一个大类：

- `bootstrap.el` 处理首次启动的包安装。
- `completion.el` 负责 Helm 和 minibuffer 补全。
- `evil-setup.el` 负责模态编辑行为。
- `git-setup.el` 负责 Magit 行为。
- `keys.el` 负责前导键绑定。
- `docs.el` 负责 Markdown 支持。
- `languages.el` 负责轻量审阅辅助和语言模式。

这样 `init.el` 保持简短，也容易定位该在哪儿修改。

## 早期启动与主题

最先遇到的体验问题之一是启动闪烁。

通常通过包安装的主题，要等 Emacs 以默认外观启动、完成包设置后才应用。这会让未经美化的 Emacs 短暂闪现，虽然很短，却很明显。

Spacemacs 更深入地控制启动过程，因此避免了大部分闪烁。为了借用这个思路，又不引入整个框架，我把主题直接纳入仓库：

- `lisp/vendor/spacemacs-theme/`

然后在 `early-init.el` 中：

- 把内置主题目录加到 `load-path`。
- 把它加到 `custom-theme-load-path`。
- 在正常初始化序列之前加载 `spacemacs-dark`。

这样，第一个窗口甚至首次安装界面出现时，就已经应用最终主题。

我还把仓库内的主题与本地 ELPA 安装版本做了差异比较，并按需同步核心主题文件，确保没有刻意保留旧版本。

## 首次启动安装器

Spacemacs 的首次启动体验出乎意料地好。安装包时，它不只是往 echo 区域输出消息，而是显示专门的全屏启动缓冲区，清楚展示进度。

这一点值得保留。

我没有复制整个 Spacemacs 启动框架，而是实现了一个小得多的 bootstrap 缓冲区：

- 全屏 `*bootstrap*` 缓冲区。
- 标题行中有明确的进度条。
- 显示 `Installing packages x/y: package-name` 日志。
- 最新安装条目显示在日志区顶部。
- 首次启动时，安装完的包立即激活。

这样保留了让人安心的启动反馈，又没有重新引入框架重量。

## 补全与文件查找

配置有意采用两套补全方式。

现代 minibuffer 补全使用：

- `vertico`
- `orderless`
- `marginalia`
- `consult`

旧式 Spacemacs 风格的文件选择器使用：

- `helm`
- `helm-flx`
- `helm-ls-git`

这是迁移中比较棘手的部分。

有一阵，`SPC f f` 显示的是 Git 分支，而不是文件。后来又开始报错：

```text
Symbol’s value as variable is void: helm-source-ls-git
```

根本原因是，较新的 `helm-ls-git` 默认使用多来源的 Git 仪表盘，部分内部来源是延迟构建的。修复办法不是临时和这些内部机制较劲，而是查看旧版本实际做了什么，再提前配置好包：

- 旧 Spacemacs 把 `SPC f f` 绑定到 `helm-ls-git`。
- 新配置现在也这样做。
- 把 `helm-ls-git-default-sources` 限制为已跟踪文件。

这样恢复了紧凑的已跟踪文件选择器，符合原来的肌肉记忆。

## Magit 的行为

保留 Magit 本身很容易，麻烦的是从空白 `*scratch*` 缓冲区打开它时的行为。

早期一次清理尝试在启动 Magit 时杀掉了 `*scratch*`。进入时看起来很干净，但破坏了退出 Magit 后的返回行为。离开 Magit 后可能落到 `*Messages*`，这不是我想要的。

理解行为后，修复很简单：

- 在同一窗口中打开 Magit。
- 如果从空白 `*scratch*` 启动，就把这个缓冲区埋到后面，而不是杀掉。

这样屏幕保持整洁，Magit 退出时也有一个合理的上一缓冲区可返回。

## 模式行与界面

Emacs 默认模式行信息太杂，完整的 Spacemacs 模式行栈又太重。

所以我选了中间道路：

- 做一个自定义的轻量模式行。
- 放进独立模块。
- 样式上接近 Spacemacs 的视觉风格。

这个模式行聚焦有用的信息：

- Evil 状态。
- 缓冲区名称。
- 修改状态。
- 位置。
- 主模式。
- Git 分支。

结果更符合我的意图，也没有重新引入庞大的依赖栈。

## 文档与语言支持

核心编辑体验稳定后，我加了一层薄薄的内容支持。

文档支持：

- `markdown-mode`。
- 为 `README.md` 使用 `gfm-mode`。
- 为正文使用 `visual-line-mode`。

审阅辅助：

- `diff-hl`
- `hl-todo`
- `rainbow-delimiters`

语言和文件类型支持：

- Swift
- HTML
- JavaScript
- Nunjucks
- JSON

这里刻意不做完整 IDE 栈，只提供足以舒服地审阅、导航和编辑的能力，避免让配置又变成另一个发行版。

## 这个项目真正带来了什么

最有用的成果不是“一套自定义 Emacs 配置”，而是一套有清晰理念的配置：

- 小到足以理解。
- 完善到用起来精致。
- 熟悉到能够保留旧习惯。
- 灵活到能够不断演进，不受框架拖累。

Spacemacs 是很有价值的参照。但它最好的部分，原来都可以迁移：

- 以前导键为中心的交互。
- Evil。
- Magit。
- 出色的启动体验。
- 用心选择的主题与模式行。

其他一切都可以商量。

## 最后的想法

这次迁移能成功，是因为目标从来不是追求纯粹。

目标不是“原生 Emacs”，也不是“不惜代价地极简”，而是保留良好的操作体验，移除多余的机制。

这是构建编辑器工具更务实的方式：保留那些价值配得上成本的部分，把其他部分重建成自己真正能掌控的形式。
