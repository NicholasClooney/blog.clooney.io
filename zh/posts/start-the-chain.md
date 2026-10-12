---
title: "Start the Chain：我的三 agent 配置，现在只要一条命令"
date: 2026-10-12
time: "12:30"
tags:
  - ai
  - agents
  - tmux-agents
  - workflow
  - tooling
  - product-engineering
excerpt: |
  我手工拼起来的主 agent、secondary 和 worker 配置，现在已经内置进 tmux-agents。一条命令启动 chain，重启后一个脚本为每个项目各启动一个，再用 /resume 找回之前的对话。
---

在[和 agent 的聊天太乱？](/zh/posts/the-agent-that-only-talks-to-me/)里，我给配置又加了一个 agent：主 agent，它唯一的工作就是和我对话。它把工作交给 secondary，secondary 协调一个 Codex worker，worker 再把工作分给自己启动的 agent。我只和主 agent 说话。

这套配置最初只是一个项目 `AGENTS.md` 里的几段话。一周后，它已经内置进 [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents)，我在每个项目里都在用。

[[toc]]

## 从操作步骤到一条命令

第一次是手工搭的。开一个新窗格，连接到现有的 Claude agent，告诉它现在是主 agent、只和我对话，再告诉原来那个 agent 它现在是 coordinator，还要确保主 agent *不* 连接 Codex。能用，但每个项目都得把这套步骤重复一遍。

现在这些角色写在 [agent-chain skill](https://github.com/TheClooneyCollection/tmux-agents/blob/main/skills/agent-chain/SKILL.md) 里。我对一个 Claude agent 说 "start the chain"，剩下的它自己完成：把自己改名为主 agent，在右边启动 secondary，再在 secondary 下方启动 worker。也可以在 shell 里运行：

```sh
tmux-agents start chain ~/Source/Projects/my-project
```

它会为这个项目开一个新窗口，并以 "start the chain" 作为第一条提示启动 Claude。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/start-the-chain/chain-in-one-window.png"
    alt="一个 tmux 窗口：左边是博客的主 agent，右上是 secondary Claude agent，右下是 Codex worker"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>博客的 chain，当时我正在告诉主 agent 下面"重启之后"一节该写什么：左边是主 agent，右上是 secondary，右下是 Codex worker。</figcaption>
</figure>

## 实际用下来改了什么

思路没变。用了一周之后，有几个细节改了。

**FYI 用 notice，不用 request。** 最初的规则是给 FYI 标上"无需回复"。这不够。在 tmux-agents 里，不管内容写了什么，request 都会让接收方重新开工，发送方也会等它回复。于是一个已经做完的 agent 被一条 FYI 唤醒，如果它没回复，就会显示为需要我处理。现在有了单独的 notice 消息，不需要回复，也不需要做事。

**secondary 和 worker 是 member，不是子 agent。** 一开始 chain 是用普通的子 agent 搭的。所以它们会和临时帮手一起出现在子 agent 列表和状态 chip 里，清理已完成的子 agent 时也可能把它们关掉。现在它们是长期 member：不出现在默认列表里，也不参与批量清理，但需要我时照样会提醒。

**chain 是看得见的。** 启动的 agent 通常在隐藏窗口里运行，要从列表里查看。chain 的三个我都想放在屏幕上，所以 secondary 和 worker 以分屏的形式开在主 agent 的窗口里。

**coordinator 改叫 secondary。** 小改动，但现在所有 skill、指南和消息都用同一个名字称呼它。

## 跨项目

我最喜欢的一条规则是关于项目之间怎么沟通的。每个项目的 secondary 是它对其他项目的接口。请求在 secondary 之间传递，agent 只修改自己项目的文件。

举个真实的例子。tmux-agents 每次发布，博客都要加一条 timeline 条目。v1.12.2 发布时，tmux-agents 的 secondary 没有自己打开博客仓库去写，而是请博客的 secondary 来做。博客的 secondary 写好并提交，然后告诉博客的主 agent：提交好了，但还没推送，因为推送会部署网站。主 agent 来问我，我推送了。

没有谁伸手去改不属于自己的项目，唯一需要我决定的事，以一个问题的形式来到我面前。

## 重启之后

我已经不再一个个地启动 chain 了。我有一个小脚本 `tmux-main-sequence`，用来搭起整个 tmux session：一个 dashboard 窗口，一个 home 目录窗口，一个博客窗口，再加上配置文件里每个项目各一个窗口。除了 dashboard，每个窗口都会用同样的 "start the chain" 提示启动一个 chain。

{% github "https://github.com/TheClooneyCollection/dotfiles/blob/2dceed571bba97a9c62bdb4f11afe69abe9da16b/.bin/tmux-main-sequence" %}

这很好用，直到机器重启。tmux 和里面所有的 agent 一起消失。再运行 `tmux-main-sequence`，窗口都回来了，也启动了新的 chain，但它们都是*新的* session。主 agent 不记得我们在聊什么，secondary 也忘了做过哪些决定。

这不是我的脚本特有的问题。任何用 `tmux-agents start chain` 的人都会遇到：重启后 chain 从头开始，上下文没了。

解决办法很简单。Claude Code 和 Codex 都会把过去的 session 保存在磁盘上，也都有可以搜索它们的 `/resume` 命令。所以重启之后，我在主 agent 的窗格里运行 `/resume`，搜到之前的 session，接着聊。

通常我只恢复这一个。没有重要的工作在进行时，新的 secondary 和 worker 就够用了。但要具体情况具体看：如果 secondary 或 worker 正在做重要的事，我也会恢复它们，让工作从停下的地方继续，而不是从头再来。

session 有名字的话，恢复起来方便得多。如果它们叫 "blog main agent"、"blog secondary" 这样的名字，一秒就能找到。没有名字的话，你得翻一整列第一条提示全是 "start the chain" 的 session。

## 试试看

用 [skills CLI](https://skills.sh) 安装 tmux-agents，agent-chain skill 也包含在内：

```sh
npx skills add TheClooneyCollection/tmux-agents -g
```

然后告诉你的 agent "set up tmux-agents"，装好之后，再说 "start the chain"。
