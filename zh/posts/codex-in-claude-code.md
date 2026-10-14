---
title: "Codex 的大脑，Claude 的 harness：在 Claude Code 里跑 GPT-6-Astra"
date: 2026-10-14
time: "10:30"
tags:
  - ai
  - agents
  - claude-code
  - codex
  - tooling
  - workflow
excerpt: |
  我拿到了一个划算的 Codex 套餐，想在 Claude Code 里试试它的模型。一个本地代理加六个小小的 fish 函数之后，`claude-astra` 就能让 Claude Code 跑在 GPT-6-Astra 上。这篇讲它怎么接起来、agent 们怎么把它做出来，以及还缺什么。
---

这个月我拿到了一个划算的 Codex 套餐。Codex 本来就是我的主力 worker，但我一天里大部分时间都在 Claude Code 里：它的 harness、它的权限模式、我的 skill 和 hook，还有我用 [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) 运行 agent 的方式。所以我也想在那里试试 Codex 的模型。

还有第二个原因。我想看看 harness 到底有多大影响。同一个模型，换一个 harness：GPT-6-Astra 在 Claude Code 里和在 Codex 里，用起来会不会不一样？唯一的办法就是用上一段时间。

现在我输入 `claude-astra`，就能得到一个跑在 GPT-6-Astra 上的 Claude Code。

[[toc]]

## 原理

Claude Code 可以连接任何支持 Anthropic Messages API 的端点。把 `ANTHROPIC_BASE_URL` 指过去，再给它一个 token 就行。

[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 是一个开源代理，正好做这件事。它用我的 Codex 账号登录，提供一个 Anthropic 风格的 API，并把每个请求转换成对我 Codex 订阅的调用。我在 Mac 上用 Docker 运行它，固定在 v8.0.27，只监听 localhost。

除了 API key，代理用的都是默认配置。

## 命令

剩下的就是我 [dotfiles](https://github.com/TheClooneyCollection/dotfiles/commit/274863a158bdb51529252a07f225ae6bff69848d) 里的六个小 fish 函数：

- `claude-astra` 在 GPT-6-Astra 上启动 Claude Code。
- `claude-codex` 列出代理提供的模型，用 fzf 选一个。
- `claude-proxy MODEL` 是前两个共用的基础。
- `cliproxy-url` 和 `cliproxy-models` 输出代理的地址和它的模型。
- `secret NAME` 从 1Password 提供的本地 env 文件里读取一个密钥。

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/codex-in-claude-code/model-picker.png"
    alt="在终端运行 claude-codex，弹出 fzf 模型选择器，gpt-6-astra 在最上面，下面是 gpt-6-sol、gpt-6-luna 和 gpt-5.6 系列模型"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>`claude-codex` 列出代理提供的模型，GPT-6-Astra 排在最上面。</figcaption>
</figure>

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/codex-in-claude-code/claude-astra-hello.png"
    alt="Claude Code v2.1.288 以 medium effort 在 gpt-6-astra 上启动，用中文回复了一句问候，状态栏显示 272k 的上下文窗口"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>Claude Code，跑在 medium effort 的 GPT-6-Astra 上。</figcaption>
</figure>

核心都在 `claude-proxy` 里：

{% github "https://github.com/TheClooneyCollection/dotfiles/blob/274863a158bdb51529252a07f225ae6bff69848d/.config/fish/functions/claude-proxy.fish" %}

代理需要一个 API key，而这些函数里从来不包含它。`secret` 在启动时从 1Password 提供的 env 文件里读取，所以 key 只存在于 1Password 中。正因为这样，这些函数才可以放心提交到公开的仓库。

key 也只通过 `env` 设置给 `claude` 这一个进程，不会泄露到我的 shell 里。

### 两个关键设置

**上下文窗口。** Claude Code 不认识这些模型，所以默认按 200k 的窗口处理。GPT-6-Astra 实际有 272k，所以 `claude-proxy` 设置了 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 来匹配。在我的 Pro 套餐上，gpt-5.6 系列模型有 921k，所以它们有单独的分支。

**Effort。** Claude Code 可以在 `settings.json` 里按模型设置 effort。我把 GPT-6-Astra 设成了 medium，截图里显示的就是这个。

## 它是怎么做出来的

这些代码我一行都没写。是代理所在的那个私有仓库的 agent chain 写的：一个主 agent、一个 secondary 和一个 Codex worker，根据我一连串的要求：

1. 把 CLIProxyAPI 搭成一个固定版本、纳入 git 管理的 Docker Compose 配置。
2. 给我一条可以直接复制测试的 `claude` 命令。
3. 用 GPT-6-Astra 最简单的方式是什么？
4. 模型别硬编码那么多次，只写一次。
5. 把 key 放进 1Password，而且不要把 env 文件、代理和 Claude 之间的关联写死。
6. 我还是想要 `claude-astra`，所以把 `claude-codex` 里通用的部分抽成一个基础函数。
7. 全部存进我的 dotfiles。

每个要求都让这些函数变了一点。最后一步跨了项目。我的 dotfiles 有自己的 chain，所以代理项目的 secondary 给 dotfiles 的 secondary 发了一个请求，正是我上一篇里讲的 [secondary 对 secondary 规则](/zh/posts/start-the-chain/#%E8%B7%A8%E9%A1%B9%E7%9B%AE)。dotfiles 的 secondary 加上了这六个函数，检查了它们和已有的函数没有冲突、env 文件不会进 git，又在一个新的 shell 里做了冒烟测试，然后提交。

### 还是做了我们自己的

在定下 fish 函数之前，worker 派了两个子 agent 去调研已有的方案。它们比较了 14 个 Claude Code 的启动器和模型切换工具。其中 [melonamin 的 claudex gist](https://gist.github.com/melonamin/fdfe168c78273820cf68346316f497ca) 和我们做的非常接近：fish、CLIProxyAPI、一个 `claudex` 命令。

结论是保留我们自己的，借鉴别人的想法，而不是换成其中某一个。所以尽管很像，我们还是用自己的。

## 一个关于自动批准的警示

我的 agent 是在自动批准模式下运行的。在把代理改到 localhost 端口时，其中一个 agent 用 `rm` 做清理，把我真正的 `config.yaml` 删掉了。里面的 API key 也没了。

这次影响范围很小。我对默认配置唯一的改动就是这个 key，而它存在 1Password 里。没有涉及任何生产环境，也没有造成任何损失。那个 agent 道了歉，还给自己存了一条记忆：以后绝不再这样做。

但这提醒了我自动批准意味着什么：agent 可以不问一声就删除文件。打开它之前，值得想想它够得着哪些东西。

## 还缺什么

在 Claude Code 里跑 Codex，和在 Claude Code 里跑 Claude 不一样。我常用的两样东西没有了：

1. **Artifacts。** Claude 可以发布一个我能在手机上打开的页面。在这里不行。
2. **Claude in Chrome。** Claude 通过它的 Chrome 扩展操作我的浏览器。Codex 大概也能操作 Chrome，但需要别的东西来驱动。

## 接下来

配置已经搞定。真正的实验现在才开始：在两个 harness 里用同一个模型，看看哪里感觉不一样。用一段时间之后，我再写下来。
