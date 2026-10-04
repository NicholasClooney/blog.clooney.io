---
title: "如何借助 AI 快速推进，又不把事情搞坏"
date: 2026-10-04
time: "11:35"
tags:
  - ai
  - agents
  - tmux-agents
  - tooling
excerpt: |
  借助 AI 快速推进，在真实使用表明有必要时，补上扎实的工程设计。对 tmux-agents 来说，就是先让智能体名称兼作 id，直到行不通，再引入真正的 id 和防护措施，让我和智能体不再重蹈覆辙。
---

[tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 几天内就从 v1.0.0 走到了 v1.8.0。早期有个让事情保持简单的捷径：智能体名称同时也是它的 id。随着我越来越多地使用 tmux-agents，这条捷径开始行不通。这篇文章讲的是它在哪里出了问题，以及我做了什么来修复它。

简单来说：借助 AI 快速推进，在真实使用表明有必要时，补上扎实的工程设计。

[[toc]]

## 那条捷径

tmux-agents 将 tmux 窗格中的 AI 智能体连接起来。它们用 `tmux-ask` 互发消息，用 `tmux-spawn` 启动子智能体，我则通过 `prefix + a` 查看所有智能体。

<figure>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; align-items: start;">
    <img src="/assets/images/timeline/tmux-agents/message-request.png" alt="Claude 的请求抵达 Codex 窗格" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/message-reply.png" alt="Codex 的回复返回 Claude 窗格" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/projects/tmux-agents.png" alt="tmux-agents 列表展示子智能体的状态、父级，以及所选会话的实时预览" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;">Claude 用 <code>tmux-ask</code> 向 Codex 提问，回复以新消息的形式返回；<code>prefix + a</code> 则列出全部智能体并提供实时预览。</figcaption>
</figure>

每个智能体都有一个易读的名称，比如 `claude-~-1` 或 `spirit-earth`。这个名称也用作其他所有数据的键：重新打开已关闭智能体时使用的会话记录、子智能体指向父级的链接，以及等待投递的消息队列。

这是最简单的可行方案，而且确实奏效。无须设计 id 体系，也没有额外信息需要展示或隐藏。出了问题，记录中的名字就是屏幕上的名字。

## 它开始不适用的地方

后来，我用得越来越多。同时运行好几条智能体协作链，每条都有一个主智能体、一个负责协调的副手，以及一个带有自己子智能体的 Codex 执行者。窗口和项目越来越多，子智能体关闭几天后又重新打开，智能体也会在中途改名。

到了这个规模，名称就不适合作为 id 了：

- 同一项目里的两条协作链都想叫 `main`。
- 已关闭智能体的名称会重新空出来，新智能体可以占用它。
- 给智能体改名，意味着重写所有指向它的链接。

10 月 4 日，我和智能体正在处理改名功能时，在出事之前发现了一个具体 bug：用已关闭智能体的名称创建新智能体，会覆盖旧智能体的记录。旧对话无法再恢复，它已关闭的子智能体看起来也会变成新智能体的孩子。`claude-x-1` 这类自动名称也会以同样的方式重复使用编号。

这随时都可能发生，甚至可能已经发生过。但我和智能体都没有想过这个边界情况。

## 修复：真正的 id

为 v1.9.0 开发中的修复方案很朴素：

- 每个智能体创建时都会获得一个隐藏的唯一 id。
- 记录、父级链接和消息队列都以这个 id 为键。
- 名称变成显示标签，在活跃智能体中保持唯一，也可以自由修改。
- `--resume-id` 用来重新打开某个特定智能体。
- 以名称为键的旧记录会就地迁移一次，让原本可以恢复的对话仍然可以恢复。

这些 id 不会碍事。我看到和使用的仍然是名字，智能体需要 id 时，可以用命令查询。

## 随着问题出现，逐步建立防护

只修复每个 bug 还不够。我希望下一个开发 tmux-agents 的智能体，或我自己，不再犯同类错误。因此，同样是在这几天里，每个问题都留下了一些东西：

- **进程预算测试。** 在我的实际环境中，生成一次智能体列表曾经会启动约 850 个进程，耗时 4.5 秒；在更大的测试样例中约为 2,650 个进程。现在只需 12 到 15 个进程、0.1 秒；超过 20 个进程，测试就会失败。
- **“needs you” 回归测试集**，防止已完成工作的智能体又被标记成等待我处理。
- **`docs/decisions/` 中的决策记录**，在任何行为变更之前写下。
- **`AGENTS.md` 中的规则**：不稳定测试会阻止发布，已发布的标签不能移动，智能体在主要工作完成后立即回复。
- **`tmux-ask` 绝不丢弃消息。** 如果接收方已经不在，消息会被保存，并通知发送方。

## 快速推进，在需要时补上工程设计

快速做原型，让最简单的方案先带你前进。最初用名称当 id 是正确的选择。它让 tmux-agents 得以发布、投入使用，我也因此发现它在哪些地方撑不住。

然后，就在真实使用暴露需求的地方补上结构，不必提前。出了问题，也别止步于修复。把教训写在下一个智能体会读到的地方；更好的是，把它变成一项会失败的测试。
