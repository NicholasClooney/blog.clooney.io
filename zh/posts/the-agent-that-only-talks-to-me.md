---
title: "和 agent 的聊天太乱？你只需要再加一个。真的。"
date: 2026-10-02
time: "19:25"
tags:
  - ai
  - agents
  - tmux-agents
  - workflow
  - tooling
excerpt: |
  一个项目最多有十个 agent 同时工作，而与我对话的 Claude 还要处理回复、合并和服务器，我总得等它有空。解决办法是再加一个窗格：主 agent 只负责与我交流，原来的那个则成为 coordinator。
---

最近几天，我一直用 [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 同时运行许多 agent。在 Stone Age 重制项目上，可能有五到十个同时工作，另外还有几个处理轻量的支线项目。整体感觉很棒，但做了一处小调整后，这套配置才不再显得混乱。

[[toc]]

## 配置

Codex 是这个项目的主要实现者。这个月 Pro 计划拿到了不错的优惠，所以繁重工作都交给它：接下任务、拆分，再通过 tmux-agents 启动自己的子 agent，每个都使用[工作树池](/zh/posts/i-gave-my-coding-agents-a-shared-worktree-pool/)中的一个槽位。

在我与 Codex 之间，还有一个 Claude agent。我与 Claude 对话，Claude 把工作交给主 Codex，Codex 再分派给子 agent，回复沿着同一条链返回。全部加起来，可能有十个 agent 同时运行。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/the-agent-that-only-talks-to-me/codex-sub-agents.png"
    alt="tmux-agents 列表显示三个正在工作的 Codex 子 agent 和两个已关闭的子 agent，并实时预览其中一个"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>从 tmux-agents 看到的主 Codex 子 agent：三个工作中，两个已经关闭。</figcaption>
</figure>

## 问题：一个 agent 做两份工作

链条本身运转正常。问题出在中间的 Claude，因为它同时承担两份差别很大的工作。

一份是与我交流：回答问题、请我做决定、接收新任务。另一份是运行项目：接收 Codex 报告、审阅并合并工作、重启在线服务器、编辑文件。两种工作都落进同一段对话。

于是历史记录成了什么都有的信息流。Codex 回复提交哈希和截图列表，接着是 cherry-pick、更新日志检查、服务器重启、后台构建结束。中间某处夹着一个问我的问题，再往后某处才是我的回答。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/the-agent-that-only-talks-to-me/coordinator-before.png"
    alt="Claude agent 的历史记录：Codex 的长回复之后，接着是 cherry-pick、更新日志检查、停止并重启服务器"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>之前：与我对话的 agent，也在合并 Codex 的工作和重启服务器。</figcaption>
</figure>

更糟的是，我经常得等轮到自己。如果 Claude 正在处理 Codex 回复或执行命令，我的问题就排在这些工作后面。本该与我交流的 agent，成了屋里最忙的那个。

## 解决办法：再加一个窗格

我又加了一个 Claude agent。全部改动就是这个。

我在同一个 tmux 窗口里打开新窗格，把它连接到已有的 Claude，并告诉它职责：现在你是主 agent，只和我交流。你不写代码，也不运行项目。任何需要做的事，都交给另一个 Claude；后者现在是我们与主 Codex 之间的 coordinator。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/the-agent-that-only-talks-to-me/main-and-coordinator.png"
    alt="三个 tmux 窗格：左边的主 Claude 与我聊天，右上角是 coordinator Claude，右下角的主 Codex 正在向子 agent 发送请求"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>之后：左边的主 Claude 只与我聊天。右上角 coordinator 与右下角主 Codex 沟通，再由后者联系子 agent。</figcaption>
</figure>

现有 agent 完全不用改变。原来的 Claude 保留历史、与 Codex 的连接，以及进行中的工作，只是不再是我直接对话的对象。

我还刻意没有把新的主 agent 连接到 Codex。如果它能直接与 Codex 沟通，Codex 报告就又会流进我的对话，一切回到原点。主 agent 恰好只有一个同伴：coordinator。

## 把角色写下来

当场告诉新 agent 职责，暂时有效。为了让它长期成立，让任何读到项目的 agent 都知道谁做什么，我把角色和消息规则写进了项目的 `AGENTS.md`。下面是这一节，保留了 agent 名称：

```markdown
## Agent roles and messages

Three agents work together in tmux panes: main agent → coordinator → worker.

- **main agent (Claude, `claude-projects-stone-age-2`)**: interfaces with the user
  and the other agents: clarifies intent, turns it into self-contained tasks and
  relays user decisions. Does not investigate or implement.
- **coordinator (Claude, `claude-projects-stone-age-1`)**: coordinates Codex and
  owns the main checkout: merges Codex commits, runs importers, backs up saves,
  relaunches the server, runs tests and records decisions in docs. Sends anything
  that needs a user decision to the main agent, not to the user.
- **worker (Codex, `codex-projects-stone-age-1` and its sub agents)**: main
  implementer. Sub agents split work by file ownership to avoid conflicts.

Messages:

- Everything goes through `tmux-ask`. Long reports go in a file; the message is a
  short summary plus the path.
- The user reads coordinator→main agent messages directly, so the main agent does
  not restate them; it surfaces a decision as a one-line summary plus options.
- Mark FYIs "no reply needed". A decision request states the default and what is
  blocked meanwhile.
- An instruction the user gives directly to any agent wins; that agent tells the
  others what changed.
```

有几条规则比预想中更重要。“凡是需要用户决定的事，都交给主 agent，而不是用户”，防止 coordinator 悄悄又变成我的直接对话对象。“说明默认选择和期间被阻塞的工作”，让我知道如果一小时不理这条决策请求，会发生什么。而“用户直接给任何 agent 的指令优先”，则保留了绕过链条的通道：必要时，我仍能在任意窗格输入，收到指令的 agent 负责告知其他成员。

## 前后对比

**之前：** coordinator 一直很忙。Codex 消息不断进来，它不断问我做决定，也不断执行命令。想提问或布置任务，得等空隙。

**之后：** 我只和主 agent 交流。它回答能回答的，其余交给 coordinator，再由 coordinator 视情况交给 Codex。coordinator 的回复出现在主 agent 窗格里，我可以在消息到达时直接阅读，主 agent 不再重复。只有需要我时，它才介入，用一句摘要列出选项。

<style>
  .agents-vs { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); gap: 1rem; align-items: stretch; }
  .agents-vs-panel { border: 2px solid currentColor; border-radius: 12px; padding: 1rem 0.75rem; }
  .agents-vs-panel svg { display: block; width: 100%; height: auto; font-family: inherit; }
  .agents-vs-divider { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .agents-vs-divider::before, .agents-vs-divider::after { content: ""; flex: 1; border-left: 2px dashed currentColor; opacity: 0.4; }
  .agents-vs-badge { width: 3rem; height: 3rem; border-radius: 50%; background: var(--accent, #E7040F); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; letter-spacing: 1px; }
  @media (max-width: 640px) {
    .agents-vs { grid-template-columns: minmax(0, 1fr); }
    .agents-vs-divider { flex-direction: row; }
    .agents-vs-divider::before, .agents-vs-divider::after { border-left: 0; border-top: 2px dashed currentColor; }
  }
</style>
<figure style="margin: 1.5rem 0;">
  <div class="agents-vs">
    <div class="agents-vs-panel">
      <svg viewBox="0 0 420 470" role="img" aria-labelledby="agents-before-title">
      <title id="agents-before-title">之前：我与一个 Claude agent 对话，它也负责运行项目，并与 Codex 及其子 agent 传递消息</title>
      <defs>
        <marker id="agents-arrow-b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <text x="210" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" letter-spacing="2">之前</text>
      <rect x="130" y="40" width="160" height="44" rx="22" fill="none" stroke="currentColor" stroke-width="2" />
      <text x="210" y="68" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">我</text>
      <line x1="210" y1="88" x2="210" y2="120" stroke="currentColor" stroke-width="2" marker-start="url(#agents-arrow-b)" marker-end="url(#agents-arrow-b)" />
      <rect x="80" y="124" width="260" height="170" rx="10" fill="none" stroke="var(--accent, #E7040F)" stroke-width="3" />
      <text x="210" y="152" text-anchor="middle" font-size="17" font-weight="700" fill="var(--accent, #E7040F)">Claude</text>
      <text x="210" y="172" text-anchor="middle" font-size="13" fill="currentColor" opacity="0.75">一个 agent，一份历史，包办一切</text>
      <text x="104" y="202" font-size="14" fill="currentColor">· 我的问题与决定</text>
      <text x="104" y="224" font-size="14" fill="currentColor">· Codex 报告</text>
      <text x="104" y="246" font-size="14" fill="currentColor">· 合并与测试</text>
      <text x="104" y="268" font-size="14" fill="currentColor">· 重启服务器、编辑文件</text>
      <line x1="210" y1="298" x2="210" y2="330" stroke="currentColor" stroke-width="2" marker-start="url(#agents-arrow-b)" marker-end="url(#agents-arrow-b)" />
      <rect x="110" y="334" width="200" height="44" rx="10" fill="none" stroke="currentColor" stroke-width="2" />
      <text x="210" y="362" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor">Codex</text>
      <path d="M150 378 L90 420 M210 378 L210 420 M270 378 L330 420" stroke="currentColor" stroke-width="1.5" fill="none" />
      <rect x="40" y="420" width="100" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <rect x="160" y="420" width="100" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <rect x="280" y="420" width="100" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <text x="90" y="442" text-anchor="middle" font-size="13" fill="currentColor">子 agent</text>
      <text x="210" y="442" text-anchor="middle" font-size="13" fill="currentColor">子 agent</text>
      <text x="330" y="442" text-anchor="middle" font-size="13" fill="currentColor">子 agent</text>
    </svg>
    </div>
    <div class="agents-vs-divider" aria-hidden="true"><span class="agents-vs-badge">VS</span></div>
    <div class="agents-vs-panel">
      <svg viewBox="0 0 420 520" role="img" aria-labelledby="agents-after-title">
      <title id="agents-after-title">之后：我只与主 Claude 对话，由它交给 coordinator Claude，再与 Codex 及其子 agent 沟通。主 agent 与 Codex 刻意不连接。</title>
      <defs>
        <marker id="agents-arrow-a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="currentColor" />
        </marker>
      </defs>
      <text x="210" y="22" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" letter-spacing="2">之后</text>
      <rect x="130" y="40" width="160" height="44" rx="22" fill="none" stroke="currentColor" stroke-width="2" />
      <text x="210" y="68" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">我</text>
      <line x1="210" y1="88" x2="210" y2="120" stroke="currentColor" stroke-width="2" marker-start="url(#agents-arrow-a)" marker-end="url(#agents-arrow-a)" />
      <rect x="80" y="124" width="260" height="62" rx="10" fill="none" stroke="var(--accent, #E7040F)" stroke-width="3" />
      <text x="210" y="152" text-anchor="middle" font-size="17" font-weight="700" fill="var(--accent, #E7040F)">主 Claude</text>
      <text x="210" y="173" text-anchor="middle" font-size="13" fill="currentColor" opacity="0.75">只与我交流，不写代码</text>
      <line x1="210" y1="190" x2="210" y2="222" stroke="currentColor" stroke-width="2" marker-start="url(#agents-arrow-a)" marker-end="url(#agents-arrow-a)" />
      <rect x="80" y="226" width="260" height="128" rx="10" fill="none" stroke="currentColor" stroke-width="2" />
      <text x="210" y="254" text-anchor="middle" font-size="17" font-weight="700" fill="currentColor">coordinator Claude</text>
      <text x="104" y="284" font-size="14" fill="currentColor">· Codex 报告</text>
      <text x="104" y="306" font-size="14" fill="currentColor">· 合并与测试</text>
      <text x="104" y="328" font-size="14" fill="currentColor">· 重启服务器、编辑文件</text>
      <line x1="210" y1="358" x2="210" y2="390" stroke="currentColor" stroke-width="2" marker-start="url(#agents-arrow-a)" marker-end="url(#agents-arrow-a)" />
      <rect x="110" y="394" width="200" height="44" rx="10" fill="none" stroke="currentColor" stroke-width="2" />
      <text x="210" y="422" text-anchor="middle" font-size="16" font-weight="700" fill="currentColor">Codex</text>
      <path d="M150 438 L90 476 M210 438 L210 476 M270 438 L330 476" stroke="currentColor" stroke-width="1.5" fill="none" />
      <rect x="40" y="476" width="100" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <rect x="160" y="476" width="100" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <rect x="280" y="476" width="100" height="34" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
      <text x="90" y="498" text-anchor="middle" font-size="13" fill="currentColor">子 agent</text>
      <text x="210" y="498" text-anchor="middle" font-size="13" fill="currentColor">子 agent</text>
      <text x="330" y="498" text-anchor="middle" font-size="13" fill="currentColor">子 agent</text>
      <path d="M340 155 C 381 155, 381 200, 381 272 M381 300 C 381 380, 381 416, 310 416" stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="5 4" opacity="0.6" />
      <circle cx="381" cy="286" r="11" fill="none" stroke="var(--accent, #E7040F)" stroke-width="2" />
      <path d="M376 281 L386 291 M386 281 L376 291" stroke="var(--accent, #E7040F)" stroke-width="2.5" />
      <text x="404" y="286" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.75" transform="rotate(90 404 286)">未连接</text>
    </svg>
    </div>
  </div>
  <figcaption style="text-align: center;">之前，与我对话的 agent 也负责运行项目。之后，我只与主 agent 交流，其余交给 coordinator。主 agent 与 Codex 刻意不连接。</figcaption>
</figure>


## 为什么有效

事后回看，我觉得有几件事在起作用。

**对话与工作分开了。** 以前，我的对话与项目操作共享一份历史，现在分成两份。主 agent 的历史只包含我和我问过的事，于是重新像一段对话。那些噪声，包括报告、合并、日志和重启，仍然存在，只是累积在 coordinator 那里，除非出了问题，否则没人需要读。

**与我交流的 agent 总是有空。** 主 agent 几乎不亲自做工作，所以很少陷入漫长的一轮执行。我的消息不用排在服务器重启或代码审查后面，而是立刻被读到。等待从我身上转移到了 agent 身上，这才是它该在的地方。

**上下文保持较小。** 截图中，主 agent 用了 90k token，占窗口的 9%；coordinator 用了 300k，占 30%。一部分原因是主 agent 更年轻，但它也只随我们的对话增长，不会随项目里的每份报告增长。更小、更干净的上下文，agent 才真正能跟得住。

**决策以容易回答的形式送到我面前。** coordinator 发给主 agent 的是简短摘要，知会消息标明无需回复，我可以快速浏览。需要决定时，主 agent 会整理成一行，明确列出选项、默认选择和期间被阻塞的工作。选 A 还是 B，只要一秒；从一长串 Codex 报告里挖出同一个问题，可不是这样。

**只有一条路径。** 我、主 agent、coordinator、Codex、子 agent。因为主 agent 与 Codex 没连接，就没有让对话分叉到两处的捷径。每条信息都有明确的去路和回路。

这不是没有代价。每个请求多了一跳，增加一点时间和 token；每次交接又都是摘要，细节可能像传话游戏一样逐步丢失。对于这么多 agent 的项目，目前这个取舍很值得。不过我这样运行的时间还不长，还不能判断连续几周后会怎样。

## 我的收获

令人意外的是，所需改动如此之少。没有新工具，没有修改 tmux-agents，也没有重启正在工作的 agent。只是一个新窗格、一条连接，以及几句话描述的角色。

这和工作树池给我的启示相同，只是换了一个角度：agent 多了，有意思的问题不在某一个 agent 身上，而在它们彼此之间，以及它们与我之间的连接形态。与我交流的 agent 不再同时承担实际工作后，整套环境都安静了下来。
