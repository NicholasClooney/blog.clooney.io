---
title: "Tmux 70/20/10 布局快捷键"
date: 2026-05-22
time: "10:51"
tags:
  - tmux
  - cli
  - workflow
  - terminal
excerpt: "一个小小的 tmux 工作流改进：按一次快捷键创建固定的 70/20/10 纵向布局，再交换顶部与中间窗格，同时保持比例不变。"
---

我想给 tmux 工作流做一点改进：按一次快捷键，就能创建可重复使用的 `70/20/10` 纵向布局，然后把顶部占 `70%` 的窗格和中间占 `20%` 的窗格互换，同时不打乱整体比例。

[[toc]]

## 最初的尝试

Claude 给出的最初调研方向是对的，但实现细节有问题。使用 `swap-pane -s 0 -t 1` 的建议没错，先执行 `split-window -v -p 30`，再执行 `split-window -v -p 33`，布局比例的计算也没错。问题在于，它把布局快捷键当成简单的 tmux 命令组来处理，以为包一层普通的 `if-shell` 就能可靠执行整个序列。实际情况是，配置能加载，但快捷键中的分屏命令组没有正确执行。

## 修复

解决办法是放弃 tmux 快捷键绑定中脆弱的命令组解析，把逻辑移到带条件检查的 `run-shell` 中。最终实现会先检查当前窗口是否恰好只有一个窗格，再创建布局；同时记录当前窗格路径，让新窗格继承这个目录，执行两次纵向分屏，重新选中顶部窗格，再用自定义选项给窗口打上标记：`@stack702010=1`。交换窗格的快捷键也用 `run-shell`，而且只有在这个标记存在、窗口仍然恰好有三个窗格时才会执行。这样快捷键只作用于预期的布局，不会影响其他任意的三窗格窗口。

## 我是怎么测试的

找到这个方案的过程也很重要。我没有反复修改 `~/.tmux.conf`，然后在正在使用的会话里手工测试，而是把 tmux 本身当成一个轻量的 TDD 测试工具。首先用 `tmux list-keys` 查看解析后的绑定，确认 tmux 已接受快捷键文本。然后用 `tmux new-session -d` 创建后台测试会话，在这些会话上运行候选命令，再用 `tmux list-panes` 和 `tmux show-options` 核实结果。

这样就能清楚看出：原先的 `if-shell` 形式虽然加载了，却没有正确执行完整的分屏序列；`run-shell` 版本则生成了预期的三个窗格，并正确设置了 `@stack702010=1`。后台会话测试通过后，我才修改真正的配置。对这类 tmux 定制来说，这是很实用的工作方式：把 tmux 当成可以探测、可以断言验证的系统，而不只是通过界面手动试来试去的工具。

## 快捷键的手感

由我提出的优化是操作手感上的，而不是架构上的。最初能工作的快捷键是 `prefix + L` 和 `prefix + S`，这要求在按键序列中途改变修饰键的按法。后来改成用 `prefix`、`Ctrl+L` 创建布局，用 `prefix`、`Ctrl+S` 交换窗格，这样在按下 `Ctrl+B` 后，整个操作就都沿用 Control 组合键。

这个改动让快捷键按起来更舒服，不过有一个注意点：`Ctrl+S` 在某些环境下可能与终端流量控制冲突。

## 当前配置

`~/.tmux.conf` 中的当前配置：

```tmux
bind C-l run-shell 'if [ "$(tmux display-message -p "#{window_panes}")" = "1" ]; then path="$(tmux display-message -p "#{pane_current_path}")"; tmux split-window -v -p 30 -c "$path"; tmux split-window -v -p 33 -c "$path"; tmux select-pane -t 0; tmux set-option -w @stack702010 1; else tmux display-message "70/20/10 layout requires a single-pane window"; fi'

bind C-s run-shell 'if [ "$(tmux display-message -p "#{@stack702010}")" = "1" ] && [ "$(tmux display-message -p "#{window_panes}")" = "3" ]; then tmux swap-pane -s 0 -t 1; else tmux display-message "Current window is not the 70/20/10 layout"; fi'
```

## 为什么这套方案有效

最终得到的是一个小巧却稳健的 tmux 定制：布局创建结果确定，窗格交换范围明确，快捷键也足够顺手，适合反复使用。
