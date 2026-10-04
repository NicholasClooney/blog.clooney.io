---
title: "子 agent 不该消失：认识 tmux-agents"
date: 2026-10-02
time: "21:15"
tags:
  - ai
  - agents
  - tmux-agents
  - tmux
  - tooling
  - workflow
  - product-engineering
excerpt: "内置子 agent 交给你一份总结，背后的工作过程却消失了。tmux-agents 为每项委派任务提供独立 tmux 窗格中的完整 Claude 或 Codex 会话，你可以观察、介入，也能日后接着聊。"
---

我最近两篇文章，[共享工作树池](/zh/posts/i-gave-my-coding-agents-a-shared-worktree-pool/)和[只跟我说话的 agent](/zh/posts/the-agent-that-only-talks-to-me/)，其实都默默依赖着同一个工具。该给它单独写一篇了。

[tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 让 Claude 和 Codex 把工作交给你真正能看见的其他 agent。每项委派任务都在独立 tmux 窗格中获得完整的 Claude 或 Codex 会话，替代内置子 agent。我把它们叫作派生 agent。agent 之间也能互发任务和回复。我[昨天发布了 v1.0.0](/timeline/2026-10-01-shipped-tmux-agents/)。它采用 MIT 许可证，只用到了 tmux 和 bash。

<figure style="text-align: center;">
  <img
    src="/assets/images/projects/tmux-agents.png"
    alt="tmux-agents 列表：派生 agent 的状态、父 agent，以及所选 Codex 会话的实时预览"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>agent 列表（<code>prefix + a</code>）：每个派生 agent、正在做什么、由谁启动，以及会话的实时预览。</figcaption>
</figure>

[[toc]]

## 为什么做它

我在用 Claude 和 Codex 制作 Stone Age 重制版，它们都不断把工作委派给内置子 agent。那些 agent 在看不见的地方运行，我通常只能看到最终报告。报告背后的工作、读过的文件、走过的弯路、误解任务的那一刻，都消失了。

我想要的是三件事：

- 在受委派的 agent 工作时**观察**它。
- 它需要我，或偏离方向时，能够**介入**。
- 日后还能**回到**它的对话。

我本来就整天用 tmux，所以答案就在眼前：给每个 agent 一个真正的窗格。我也[用过一阵 Maestri](/zh/posts/two-small-wins-that-turned-out-to-be-the-same-win/)，它把终端放在无限画布上。应用不错，但我不喜欢整天在终端之间缩放、滚动和导航。tmux 窗格，加上按一个键就能打开的列表，更符合我的工作方式。

所以核心思路就是可观察性与记录留存。每个 agent 都是你能看见的完整会话，结束后历史也还在。

## 为什么自己做，以及谁写了它

类似工具已经有了。[smux](https://github.com/ShawnPana/smux) 和 [tmux-bridge-mcp](https://github.com/howardpen9/tmux-bridge-mcp) 也能让 tmux 窗格中的 agent 互发消息。我还是自己做了一套。这是每天都要用的工具，我想掌控体验和代码，需要什么就添加什么，不用去别人的项目开 PR，再等合并。

现在做这样的东西也很便宜，因为几乎所有工作都是 agent 完成的。说清楚一点：tmux-agents 的代码，我一行都没写，也没有审阅。我偶尔会扫一眼代码，有地方看不懂，就问 agent 或让它修改。但我的工作是产品工程。我提出想法，审阅 agent 写的规格，试用它们做出来的东西，再一起持续迭代，直到达到我想要的效果。第一个做到这一点的版本 1.0.0，大约花了半小时到一小时。

## 产品工程具体是什么样

举几个例子，说明“我的部分”在实际中意味着什么：

- **来自日常使用的想法。** 起点是在隐藏窗格里运行真实 agent，按一个键就能访问。然后是更小的需求：能不能直接让 agent 连接 Codex 并交给它任务？这成了 `tmux-connect`。没有名称的窗格打开时应该自动命名。agent 列表需要实时预览，每个 agent 还要有第二行显示正在做什么。预览占右半边后，名称、状态和父 agent 旁边放不下项目列，所以改成按项目分区分组。派生 agent 既然有 ID，为什么关闭后不能重新打开？
- **遇到边缘情况，再带回来修。** 等待后台测试的 agent 被显示为 “needs you”。消息被我留在复制模式的窗格挡住，后来加入了五分钟超时。以及本文后面提到的 needs-you 问题。
- **先谈体验，再写代码。** 我问重新打开的已关闭 agent 在列表里该怎么展示，agent 就开始实现。我让它先停下，先回答问题。然后我选了“全部列出、可搜索、保留七天”，而不是限制列表数量。
- **说不，也会不听建议而说要。** 我拒绝在状态行显示顶层 agent。我要求跨窗口连接时发送通知，尽管 agent 倾向于不加。
- **发布。** 提取成独立仓库，先在 GitHub 私下查看，审计是否有密钥，再以 MIT 开源，附上中文 README 和安装技能。我写了 README 的介绍，多次因为内容太杂或太细而退回修改，最终截图也是我自己拍的。

从 v1.3.0 开始，这类产品决策也会记录在仓库的 `docs/decisions/` 目录中，每个决策一个文件。

这些都不是写代码，而是决定工具应该是什么样，发现它还没到位的地方，然后一路引导到位。

## 用起来是什么感觉

**agent 会互相说话。** 我告诉 Claude：“连接 codex，让它审阅这个 diff。”请求作为一条新消息出现在 Codex 窗格里。Codex 完成后，回复以同样方式回到 Claude，Claude 接着工作。

**派生 agent 是真正的会话。** agent 委派任务时，新 agent 会在项目的隐藏 tmux 窗口中打开，不占用我的布局；从 v1.4.0 起，想要时也能用可见分屏。每个都是完整的 Claude 或 Codex 会话，全部历史都在屏幕上。我可以批准权限提示、继续提问，或在任务中途纠正它。

**一个键看到所有 agent。** `prefix + a` 打开派生 agent 列表，显示状态、父 agent 和实时预览。按 Enter 在弹窗中打开一个，`prefix + d` 返回。

**扫一眼就知道谁需要我。** tmux 状态栏上方的一行按项目统计 agent 数量，有 agent 等待权限或等我回应时，就变成红色或琥珀色。

**东西不会丢。** 窗格一直保留，直到我关闭。关闭的派生 agent 仍在列表里保留一周，可以连同完整对话重新打开；会话也会出现在 `codex resume` 和 `claude --resume` 中。

<figure>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 1rem; align-items: start;">
    <img src="/assets/images/timeline/tmux-agents/message-request.png" alt="Claude 的请求出现在 Codex 窗格中" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/message-reply.png" alt="Codex 的回复回到 Claude 窗格中" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;">Claude 请 Codex 做审阅，回复再作为一条新消息回到 Claude。</figcaption>
</figure>

<figure>
  <img src="/assets/images/timeline/tmux-agents/popup.png" alt="从列表中以弹窗打开隐藏的派生 Codex agent" style="display: block; width: 100%; height: auto;" />
  <figcaption style="text-align: center;">在列表中选中派生 agent 并按 Enter，就会以弹窗打开，方便我回答它或给出方向。</figcaption>
</figure>

## 我怎么用它

今天就是个很好的例子。

在 Stone Age 项目里，我和主 Claude agent 交谈。它把工作交给 coordinator Claude，后者交给 Codex，Codex 再分派给自己的派生 agent。忙的时候，大约十个 agent 同时运行，一张列表里全能看见。[上一篇文章](/zh/posts/the-agent-that-only-talks-to-me/)讲的就是这套配置。

这个博客也有自己的小团队。一个 Claude 起草文章，相邻窗格里的 Codex 负责发布：构建网站、添加时间线条目、提交、推送并检查部署。有篇文章需要修改网站依赖的 [subspace builder](https://github.com/NicholasClooney/11ty-subspace-builder)，写作 Claude 就把请求发给在那个仓库工作的第三个 Claude，收到一份总结和两个提交哈希。我看着这一切在相邻窗格里发生，中间也介入了几次。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/meet-tmux-agents/blog-agent-team.png"
    alt="三个 tmux 窗格：左边是写作 Claude，右上是发布 Codex，右下是 subspace builder 的 Claude，正在接收写作 Claude 的请求"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>博客团队：写作 Claude（左）、发布 Codex（右上），以及在 subspace builder 仓库工作的 Claude（右下），正在接收请求。</figcaption>
</figure>

## 试一试

最简单的方法是请 Claude Code 或 Codex 帮你安装：

> 请按照 https://github.com/TheClooneyCollection/tmux-agents/blob/main/skills/tmux-agents-setup/SKILL.md 为我安装 tmux-agents

它会检查现有环境，每项配置修改前先展示给你，再带你走一遍快速入门。需要 tmux 3.2+ 和 bash，安装 `fzf` 会让选择界面更好用。[README](https://github.com/TheClooneyCollection/tmux-agents) 中也有手动步骤。

然后试试：

1. 分割一个 tmux 窗口，在一个窗格启动 `claude`，另一个启动 `codex`。
2. 告诉 Claude：“用 tmux-agents 连接 codex 窗格，让它审阅这个 diff。”
3. 告诉 Claude：“启动一个子 agent，给解析器添加测试。”
4. 按 `prefix + a` 看它工作。

## 简单看看内部

使用它不需要了解这些，但有几个选择决定了它的行为。完整说明在 [DESIGN.md](https://github.com/TheClooneyCollection/tmux-agents/blob/main/DESIGN.md)。

- **消息直接粘贴到另一个 agent 的窗格。** 没有 MCP 服务器，也没有消息队列。粘贴适用于任何在终端运行的 agent，能唤醒空闲 agent；工具或队列只有 agent 主动去检查才有用。每条消息还会留在 agent 自己的对话中，方便我阅读。
- **发送者不等待。** 早期版本让发送者阻塞，等回复出现后再从屏幕抓取。每当另一个 agent 在等权限提示，就会卡住。现在发送者结束自己的回合，回复稍后作为新消息到达。
- **不会盖过你的输入。** 如果我正在窗格中打字或滚动，消息会先排队，等我停下再发送。
- **每条消息都用标记包住**，例如 `[request from X to Y via tmux-ask]`。如果我写到一半的草稿和消息一起被提交，agent 能分清哪部分是我的话，而且以我的话为准。
- **没有服务器，也没有状态文件。** 名称、连接和父子关系都存在 tmux 窗格上，窗格消失时，它们也随之消失。
- **Codex 需要额外处理。** Codex 在共享后台进程中执行 shell 命令，所以一个 Codex agent 可能看到另一个窗格的环境，最后用别人的名字发消息。一个小包装器把每个 Codex 固定到自己的窗格，每条请求也明确写出接收者名称，确保回复来自正确 agent。

## 目前进展

**10 月 4 日更新：**写完这篇之后，进展很快。截至 [v1.7.2](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.7.2)：

- **跨窗口连接**（[v1.2.0](https://github.com/TheClooneyCollection/tmux-agents/releases/tag/v1.2.0)），让不同项目的 agent 可以交谈。
- **替另一个 agent 启动 agent**（[v1.3.0](/timeline/2026-10-03-shipped-tmux-agents-v1-3-0/)），我现在用它组建主 agent、secondary 和worker 链。
- **可见分屏**（[v1.4.0](/timeline/2026-10-03-shipped-tmux-agents-v1-4-0/)）：派生 agent 可以直接在父 agent 旁边打开，不必放进隐藏窗口。
- **限定当前窗口的列表**（[v1.5.0](/timeline/2026-10-03-shipped-tmux-agents-v1-5-0/)），同时把所有窗口中需要我的 agent 置顶。
- **空闲 agent，以及一次关闭整棵 agent 子树**（[v1.6.0](/timeline/2026-10-03-shipped-tmux-agents-v1-6-0/)）。
- **快得多的 agent 列表**，从约 4.5 秒降到 0.1 秒，以及**等待接收者回来再投递的消息**（[v1.7.0](/timeline/2026-10-04-shipped-tmux-agents-v1-7-0/)）。

每个版本都记录在 [tmux-agents 时间线](/timeline/tmux-agents/)里。

我仍在测试更广的工作流，尤其是到处用派生 agent 替代内置子 agent。所以，这是我每天使用的工具，还不是粗糙之处已经全部摸清的成品。

目前已知的一些限制：

- agent 约定不对回复再回复，但这只是指令里的约定，工具本身不强制执行。
- 对 agent 来说，其他 agent 的消息看起来和我的输入一样。指令要求以我的话为准，有风险的动作需经我同意，但两者之间没有技术隔离墙。
- 告诉 agent 用 tmux-agents 替代内置子 agent，是指令，不是保证。
- 部分 Codex 支持依赖其内部机制，更新时可能变化。
- 我主要在 macOS 上使用。它针对 macOS 自带的 bash 3.2 编写，在 Linux 上还没经过太多使用。

**一个现成的例子：**文章发布后的第二天早晨，agent 列表把三个派生 agent 标成了 **needs you**。其实没有一个需要我，它们已经完成任务，处于空闲状态。我还在查原因。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/meet-tmux-agents/needs-you-bug.png"
    alt="tmux-agents 列表将三个派生 agent 标成 needs you，预览中的一个 agent 已经汇报完毕并处于空闲"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>三个派生 agent 被标成 “needs you”，其实都已完成并空闲。右侧预览显示，其中一个已回复，正在等新任务。</figcaption>
</figure>

这就是 tmux-agents 这种开发方式的取舍。agent 写代码，没有人工审阅，这类 bug 就会漏过去。对一个我每天用的个人项目，我可以接受。我更愿意快速迭代，问题出现时再修。

**更新：**第二天在 [v1.2.1](/timeline/2026-10-03-shipped-tmux-agents-v1-2-1/) 修好了。父 agent 把一条新规则作为请求，发给了已经完成工作的子 agent。请求意味着工作，也期待回复。它本该是一条仅供知悉的通知。请求让这些子 agent 重新变为“工作中”，但它们其实没事可做，所以回合结束时就显示为需要我。现在父 agent 用通知发送 FYI，测试也会确保正常工作流不会触发 “needs you”。

另一个确实出现的问题，是工作树塞满磁盘。后来发现它属于周边工作流，而不是 tmux-agents 本身。这就是[工作树池](/zh/posts/i-gave-my-coding-agents-a-shared-worktree-pool/)那篇文章的故事。

## 我为什么喜欢它

能看见 agent 的时候，同时运行好几个 agent 很有趣。tmux-agents 把我委派工作的 agent 从黑箱变成隔壁窗格的同事：我可以看看它们在做什么，回答问题，明天再找到它们的工作。如果你本来就常用 tmux，也用 Claude 或 Codex，不妨试试，再告诉我哪里出了问题。
