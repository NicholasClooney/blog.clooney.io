---
title: "同时做所有事：AI 与刻意"
date: 2026-11-14
time: "19:38"
tags:
  - ai
  - thinking
  - personal
excerpt: |
  有了 AI，我可以同时推进四五个项目。限制不再是我能做出什么，
  而是我自己的大脑，以及我做的事情里，有多少是我真正有意为之的。
---

*这篇最初是一个忙碌周六结束时写下的[时间线条目](/timeline/2026-11-14-thinking-everything-at-once/)，后来慢慢长成了这篇文章。*

到了晚上，六个仓库里一共有大约 85 个提交。每个 tmux 窗口里都有一条 [agent chain](https://github.com/TheClooneyCollection/tmux-agents/blob/main/skills/agent-chain/SKILL.md) 在同时工作（一个和我对话的主 agent，一个负责协调的 secondary，一个负责实现的 worker，各自在自己的窗格里）。这一天里：

- **技能：** 我的技能搬进了[独立的公开仓库](https://github.com/TheClooneyCollection/skills)，版本从 v1.0.0 升到了 v1.2.0。
- **Vision Pro：** 一次卡顿修复变成了[一篇文章](/zh/posts/vision-pro-mvd-alvr-stutter-awdl-channel-hopping/)和[一个技能](https://github.com/TheClooneyCollection/skills/tree/main/skills/avp-mvd-alvr-stutter-resolver)。
- **tmux-agents：** [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 发布了两次，v1.19.0 和 v1.20.0。
- **Dotfiles：** 跟上了上面所有这些变化。
- **EDControlRoom：** 深夜给 [EDControlRoom](https://github.com/TheClooneyCollection/EDControlRoom) 想了几个点子。
- **这个博客：** Vision Pro 那篇文章、它的示意图和插画、一个新的[游戏系列](/zh/series/gaming/)，还有一堆[时间线条目](/timeline/)。

有了 AI，感觉几乎什么都能做。我以前做梦都想不到，可以同时推进三个、四个，甚至五个项目。但自从 AI 变得这么强，我时不时就会这样工作。它不太像写代码，更像是在经营一个小工作室。很累，但是那种好的累。

不过，有两件事一直在我脑子里打转。

[[toc]]

## 瓶颈还是我的大脑

agent 可以把所有事都跑起来，可我那颗软乎乎的人类大脑装不下所有事。

我的大脑也有上下文窗口（别问我是多少 token 😆），当然，比所有 agent 加起来小得多。今天有好几次（其他日子也是），我从一个项目跳到另一个项目，只能让 agent 帮我回顾一下进度。不是别人的工作，而是*我自己*一小时前才提的改动。愚蠢的人类大脑，忘得这么快。

还有几次，遇到一个很大的设计改动，我没有去审，而是让 agent 给我一份总结。这些都是个人项目，我推得很猛，根本没时间每样都细看。总还有一件事，是我可以同时去做的。

就连这篇文章也是这么开始的。一天结束时，我让一个 agent 把每个仓库的提交都过一遍，告诉我今天做了什么。

agent 有记忆文件、交接笔记，清空会话前还有 wrap-up。我真希望自己也有这样的东西。现在，agent 就是我的这些东西。

而如果我不推得这么猛，就可以用更从容的节奏把事情过一遍，慢慢想清楚每个决定。那就是 [AI 辅助工程的两个极端](/zh/posts/the-two-extremes-of-ai-assisted-engineering/)里谨慎的那一端。

## 刻意：我们正在慢慢让出去的东西

这又把我带回了那个反复出现的问题：我花掉的那些时间和精力，是有意为之的吗？

今天我确实做了很多决定：发什么、砍什么、用哪张图、什么时候推送。但我也给了 agent 很大的空间，让它们替我做决定。有时候是我没精力了，有时候是我懒得管，有时候只是我无所谓。

这是一种取舍，也没什么问题，只要你，也就是做决定的那个人，能接受就好。

但让 agent 提醒我自己提过什么要求，是一个小信号。如果一个决定我一小时后就记不起来了，那它到底算多大的决定？有些时候，决定做出的那一刻，我其实并不在场。

我觉得这就是 **AI 正在悄悄从我们身上拿走的东西：刻意。** 当你可以同时做所有事，就越来越容易不再问自己，这真的是我想做的吗。它比以前少了。

## 我想留住的

我想在它发生的时候察觉到。在我还有精力的时候，我想自己更刻意一些。

AI 给了我前所未有的产能。但产能不等于方向。能开第五个窗口，不代表我应该开，而 agent 不会问我这个问题。这个问题得由我自己来问。

所以有些日子，我还是会全力推进，每个窗口都有 agent，只要是我自己选的，那就没问题。在另一些日子里，我想有意识地挑一两件事，和它们待得久一点，久到能记住每个决定是为什么做的，其余的就先放一放。今天顾不上的事，明天还在那里，agent 也一样。

也许偶尔慢下来，也没那么糟。
