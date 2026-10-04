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
  借助 AI 快速推进，在真实使用表明有必要时，补上扎实的工程设计。对 tmux-agents 来说，就是先让 agent 名称兼作 id，直到行不通，再引入真正的 id 和防护措施，让我和 agent 不再重蹈覆辙。
---

[tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 几天内就从 v1.0.0 走到了 v1.9.0。早期有个让事情保持简单的捷径：agent 名称同时也是它的 id。随着我越来越多地使用 tmux-agents，这条捷径开始行不通。这篇文章讲的是它在哪里出了问题，以及我做了什么来修复它。

简单来说：借助 AI 快速推进，在真实使用表明有必要时，补上扎实的工程设计。

[[toc]]

## 那条捷径

tmux-agents 将 tmux 窗格中的 AI agent 连接起来。它们用 `tmux-ask` 互发消息，用 `tmux-spawn` 启动子 agent，我则通过 `prefix + a` 查看所有 agent。

<figure>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; align-items: start;">
    <img src="/assets/images/timeline/tmux-agents/message-request.png" alt="Claude 的请求抵达 Codex 窗格" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/message-reply.png" alt="Codex 的回复返回 Claude 窗格" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/projects/tmux-agents.png" alt="tmux-agents 列表展示子 agent 的状态、父级，以及所选会话的实时预览" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;">Claude 用 <code>tmux-ask</code> 向 Codex 提问，回复以新消息的形式返回；<code>prefix + a</code> 则列出全部 agent 并提供实时预览。</figcaption>
</figure>

每个 agent 都有一个易读的名称，比如 `claude-~-1` 或 `spirit-earth`。这个名称也用作其他所有数据的键：重新打开已关闭 agent 时使用的会话记录、子 agent 指向父级的链接，以及等待投递的消息队列。

这是最简单的可行方案，而且确实奏效。无须设计 id 体系，也没有额外信息需要展示或隐藏。出了问题，记录中的名字就是屏幕上的名字。

## 它开始不适用的地方

后来，我用得越来越多。同时运行好几条 agent 协作链，每条都有一个主 agent、一个负责协调的 secondary，以及一个带有自己子 agent 的 Codex worker。窗口和项目越来越多，子 agent 关闭几天后又重新打开，agent 也会在中途改名。

到了这个规模，名称就不适合作为 id 了：

- 同一项目里的两条协作链都想叫 `main`。
- 已关闭 agent 的名称会重新空出来，新 agent 可以占用它。
- 给 agent 改名，意味着重写所有指向它的链接。

10 月 4 日，我和 agent 正在处理改名功能时，在出事之前发现了一个具体 bug：用已关闭 agent 的名称创建新 agent，会覆盖旧 agent 的记录。旧对话无法再恢复，它已关闭的子 agent 看起来也会变成新 agent 的孩子。`claude-x-1` 这类自动名称也会以同样的方式重复使用编号。

这随时都可能发生，甚至可能已经发生过。但我和 agent 都没有想过这个边界情况。

## 修复：真正的 id

修复已于 10 月 4 日随 [v1.9.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.9.0) 发布（[时间线记录](/timeline/2026-10-04-shipped-tmux-agents-v1-9-0/)），方案很朴素：

- 每个 agent 创建时都会获得一个隐藏的唯一 id。
- 记录、父级链接和消息队列都以这个 id 为键。
- 名称变成显示标签，在活跃 agent 中保持唯一，也可以自由修改。
- `--resume-id` 用来重新打开某个特定 agent。
- 以名称为键的旧记录会就地迁移一次，让原本可以恢复的对话仍然可以恢复。在我自己的环境中，迁移保留了全部 67 条会话记录和全部 64 个可恢复对话，并与迁移前自动生成的备份进行了核对。

这些 id 不会碍事。我看到和使用的仍然是名字，agent 需要 id 时，可以用命令查询。

## 随着问题出现，逐步建立防护

只修复每个 bug 还不够。我希望下一个开发 tmux-agents 的 agent，或我自己，不再犯同类错误。因此，同样是在这几天里，每个问题都留下了一些东西：

- **进程预算测试。** 在我的实际环境中，生成一次 agent 列表曾经会启动约 850 个进程，耗时 4.5 秒；在更大的测试样例中约为 2,650 个进程。现在只需 12 到 15 个进程、0.1 秒；超过 20 个进程，测试就会失败。
- **“needs you” 回归测试集**，防止已完成工作的 agent 又被标记成等待我处理。
- **`docs/decisions/` 中的决策记录**，在任何行为变更之前写下。
- **`AGENTS.md` 中的规则**：不稳定测试会阻止发布，已发布的标签不能移动，agent 在主要工作完成后立即回复。
- **`tmux-ask` 绝不丢弃消息。** 如果接收方已经不在，消息会被保存，并通知发送方。

## 快速推进，在需要时补上工程设计

快速做原型，让最简单的方案先带你前进。最初用名称当 id 是正确的选择。它让 tmux-agents 得以发布、投入使用，我也因此发现它在哪些地方撑不住。

然后，就在真实使用暴露需求的地方补上结构，不必提前。出了问题，也别止步于修复。把教训写在下一个 agent 会读到的地方；更好的是，把它变成一项会失败的测试。
