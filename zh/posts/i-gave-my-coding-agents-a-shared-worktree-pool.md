---
title: "我给编程 agent 做了一个共享 worktree 池"
date: 2026-10-02
time: "10:15"
tags:
  - ai
  - agents
  - git
  - workflow
  - tooling
  - tmux-agents
excerpt: |
  Claude、Codex 和它们的子 agent 各有自己的 git worktree，我的磁盘却悄悄被这个 8GB 游戏项目的副本填满了。解决办法是一个小脚本，让 agent 从共享池借用 worktree，而不是不断新建。
---

最近和 Claude、Codex 一起做 Stone Age 重制版，非常开心。多数时候都有几个 agent 同时工作：一个做 UI 页面，一个追查导入器 bug，还有几个子 agent 做研究或清理。每个 agent 都在自己的 git worktree 中工作，谁也不会踩到别人的检出目录。

它们都通过 [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 运行，这是我[昨天发布](/timeline/2026-10-01-shipped-tmux-agents/)的小工具，[项目页](/projects/)上也有。每个 Claude 或 Codex 子 agent 都有自己的 tmux 窗格，我可以看着它们工作，需要我时介入，也能让它们互相交接任务。正是它，让同时运行这么多 agent 变得轻松；而这么多 worktree 会堆起来，也有它的一份原因。

<figure>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; align-items: start;">
    <img src="/assets/images/timeline/tmux-agents/message-request.png" alt="Claude 的请求抵达 Codex 窗格" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/timeline/tmux-agents/message-reply.png" alt="Codex 的回复返回 Claude 窗格" style="display: block; width: 100%; height: auto;" />
    <img src="/assets/images/projects/tmux-agents.png" alt="tmux-agents 列表展示子 agent 的状态、父级，以及所选会话的实时预览" style="display: block; width: 100%; height: auto;" />
  </div>
  <figcaption style="text-align: center;">Claude 用 <code>tmux-ask</code> 向 Codex 提问，回复以新消息的形式返回；<code>prefix + a</code> 列出所有子 agent 并提供实时预览。</figcaption>
</figure>

这一部分运作得很好。我没想过的是，它们会留下什么。

[[toc]]

## 一不留神，磁盘就满了

项目带着大约 8GB 的游戏资源。worktree 对 git 来说成本很低，但这个项目每次新检出，都要一份自己的资源副本，再加一份自己的 Godot 导入缓存。agent 创建 worktree，做完任务，就走了。没人清理，agent 没有，说实话，我也没有。

于是 worktree 越积越多，直到磁盘空间告急。今天早上，我打开 DaisyDisk 清理了一遍。估计删掉了 300 到 400GB 的 worktree。这只是估计，不是仔细测量的结果。

## 并行工作容易，清理才是真正的活

把并行任务交给 agent 很容易，每个 agent 工具都能用一条命令或一句指令做到。但没人替你制定这些任务所消耗资源的规则。每个 agent 都做出了局部合理的选择：“我需要一个隔离的检出目录，那就建一个。”这些选择加起来，就把磁盘装满了。

这改变了我对这套工作流的看法。如果我想继续在自己在意的项目上同时运行多个 agent，那么管理它们留下的东西就是工作流的一部分，不能事后才想起。这和人与人合作一样：一个只创建分支、从不删除分支的团队，迟早会被分支淹没。

## 规则：借一个位置，用完归还

所以，我给项目中的所有 agent 加了一条规则：不要创建 worktree，从池里借一个。

这个池是一个小 Python 脚本，维护一组固定、可复用的 worktree 槽位，`pool-a`、`pool-b` 等。agent 为某个分支申请槽位，完成工作，在分支合并后释放。下一个 agent 拿到同一个目录时，环境已经准备好了。

几个细节让它真正可用：

- **从小规模开始，自动增长，但有上限。** 池最初有五个槽位，全部忙碌时会继续创建，最多十个。超过十个就停止，告诉 agent 来问我。我同意后，它再带 `--approved-by-user` 重新运行。脚本无法验证到底是谁批准的。它是一个减速带，把“悄悄再建一个 8GB 副本”变成一个问题，而不是安全边界。
- **租约保存在 git 公共目录中。** 每个 worktree 共享仓库的 `.git` 目录，因此其中的租约文件对所有 worktree 可见，又不会被 git 跟踪。每次获取和释放都加文件锁，防止两个 agent 同时抢到一个槽位。
- **释放条件刻意设得严格。** 槽位里有未提交修改，或分支尚未合并，就拒绝释放。agent 可以传入 `--abandon`，明确放弃未合并的工作；无论如何，分支及其提交都会保留。

## 共享大目录

复用槽位可以阻止 worktree 数量不断增长。另一半工作，是让每个槽位足够便宜。

多数任务只读取资源，所以在我的项目中，只读目录以及通常情况下的游戏资源，都通过符号链接指回主检出目录。八个槽位指向同一份资源，几乎不额外占空间。

有些任务确实需要修改资源，例如调整导入器。这时 agent 会申请独立副本，脚本则创建 APFS 写时复制克隆，也就是 macOS 上的 `cp -c`。克隆在实际发生变化前，与原件共享磁盘块，因此创建很快，空间只会随任务修改的内容增长。每个槽位的 Godot 导入缓存也采用相同方式，只要主检出目录的缓存更新，就刷新它。

下面是在临时仓库中的一小段操作：

```text
$ worktree_pool.py acquire --owner claude --branch feat/inventory --task "inventory screen"
~/projects/game.worktrees/pool-a
$ worktree_pool.py acquire --owner codex --branch fix/sprite-import --task "fix sprite importer" --own assets/raw
~/projects/game.worktrees/pool-b
$ worktree_pool.py status
pool-a  claude         feat/inventory             0.0h  inventory screen
pool-b  codex          fix/sprite-import          0.0h  fix sprite importer
pool-c  free (created on first use)
pool-d  free (created on first use)
pool-e  free (created on first use)
pool: 2 created, 2 leased; grows by itself up to 10, more needs a human
$ worktree_pool.py release pool-b
fix/sprite-import is not merged into main; merge it first, or rerun with --abandon (the branch and its commits stay).
$ git merge fix/sprite-import && worktree_pool.py release pool-b
released pool-b (branch fix/sprite-import kept)
```

agent 从 `acquire` 获得槽位路径，再 `cd` 进去。我在项目的 `AGENTS.md` 中加了一小节，告诉 Claude 和 Codex 始终通过这个池操作，而且要先问我，不能自行传入 `--approved-by-user`。

## 一个可以自行改造的版本

最初的脚本专为这个项目定制：macOS、Godot，以及硬编码的目录名。为这篇文章，我做了一个更通用的版本。它只有一个文件，除了 Python 3.8 和 git，没有其他依赖，会读取随项目提交的一个小型 `worktree-pool.json`：

```json
{
  "symlink": ["references"],
  "clone": [".cache/import"],
  "symlink_unless_owned": ["assets/raw"]
}
```

- `symlink`：每个槽位都只读、不写的目录。
- `clone`：每个槽位都需要独立副本的目录，比如构建或导入缓存。
- `symlink_unless_owned`：默认共享，任务通过 `--own PATH` 申请时才复制。

复制在 macOS 上使用 APFS 克隆，在支持的 Linux 环境中使用 reflink，否则使用普通复制。基础分支从远程仓库检测，池位于检出目录旁边的 `<repo>.worktrees/`。运行 `worktree_pool.py init` 可以得到示例配置。

测试时碰到一个坑：所有配置的目录都必须被 gitignore 忽略，而且匹配规则也得能匹配符号链接。带尾斜杠的 `assets/` 只匹配目录，所以 git 会把每个槽位中的符号链接报告为新文件。要写成 `assets`。遇到这种情况，脚本会发出警告。

{% github "https://gist.github.com/NicholasClooney/feab42b78ee881bd486c64bbccfbcbdb/dd027d6af7157777ad54a0e7c877a36b0ebfe8cc?file=worktree_pool.py" %}

需要说清楚这个版本的成熟度：通用版本刚写出来。我在 macOS 的临时仓库中测试过，但没有在 Linux 上运行过，也没经过大量 agent 并发压力测试，更没有长期使用到足以评价可靠性的程度。300 到 400GB 是我手动删除的量，不是测得的池化节省空间。我认为这个思路在我的项目之外也有用，但目前还没有证明。

## 关于 agent 基础设施，我学到了什么

我一开始并不是想设计 agent 框架。我是想做游戏，而 agent 在我热爱的项目里制造了一个真实问题。最后的解决办法很小，也很朴素：租约文件、一把锁、几个符号链接，以及一条规则。

这大概就是教训。agent 很擅长完成眼前的任务，却很不擅长察觉任务给其他人带来的成本。磁盘只是第一个让我切身体会到这一点的资源。能长期持续的工作流，会让共享资源，包括磁盘、端口、模拟器、API 预算，都有负责人、有上限，也有归还方式。
