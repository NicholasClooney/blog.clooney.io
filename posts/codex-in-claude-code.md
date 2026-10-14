---
title: "Codex Brain, Claude Harness: Running GPT-6-Astra in Claude Code"
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
  I got a good deal on a Codex plan and wanted to try its models inside Claude
  Code. A local proxy and six small fish functions later, `claude-astra` starts
  Claude Code on GPT-6-Astra. Here's how it's wired, how the agents built it,
  and what's still missing.
---

I got a good deal on a Codex plan this month. Codex is already my main worker, but most of my day happens in Claude Code: its harness, its permission modes, my skills and hooks, and the way I run agents with [tmux-agents](https://github.com/TheClooneyCollection/tmux-agents). So I wanted to try the Codex models there too.

There's a second reason. I want to see how much the harness matters. Same model, different harness: does GPT-6-Astra feel different in Claude Code than it does in Codex? The only way to find out is to use it for a while.

Now I type `claude-astra` and get Claude Code running on GPT-6-Astra.

[[toc]]

## How it works

Claude Code can talk to any endpoint that speaks the Anthropic Messages API. You point `ANTHROPIC_BASE_URL` at it and give it a token.

[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) is an open-source proxy that does exactly that. It signs in with my Codex account, serves an Anthropic-style API, and translates each request into a call on my Codex subscription. I run it in Docker on my Mac, pinned to v8.0.27, and it only listens on localhost.

Apart from the API key, the proxy runs on its default config.

## The commands

The rest is six small fish functions in my [dotfiles](https://github.com/TheClooneyCollection/dotfiles/commit/274863a158bdb51529252a07f225ae6bff69848d):

- `claude-astra` starts Claude Code on GPT-6-Astra.
- `claude-codex` lists the models the proxy serves and lets me pick one with fzf.
- `claude-proxy MODEL` is the base both of them use.
- `cliproxy-url` and `cliproxy-models` print the proxy's address and its models.
- `secret NAME` reads one secret from a local env file that 1Password provides.

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/codex-in-claude-code/model-picker.png"
    alt="Running claude-codex in a terminal shows an fzf model picker with gpt-6-astra at the top, followed by gpt-6-sol, gpt-6-luna and gpt-5.6 models"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>`claude-codex` lists what the proxy serves, with GPT-6-Astra on top.</figcaption>
</figure>

<figure style="text-align: center;">
  <img
    src="/assets/images/posts/codex-in-claude-code/claude-astra-hello.png"
    alt="Claude Code v2.1.288 started on gpt-6-astra with medium effort, answering a hello in Chinese, with a 272k context window in the status line"
    style="display: block; width: 100%; height: auto;"
  />
  <figcaption>Claude Code, running on GPT-6-Astra with medium effort.</figcaption>
</figure>

`claude-proxy` is where everything happens:

{% github "https://github.com/TheClooneyCollection/dotfiles/blob/274863a158bdb51529252a07f225ae6bff69848d/.config/fish/functions/claude-proxy.fish" %}

The proxy needs an API key, and the functions never contain it. `secret` reads it at launch from an env file that 1Password provides, so the key only lives in 1Password. That's what makes it safe to commit these functions to a public repo.

The key is also only set for the `claude` process, through `env`, so it doesn't leak into my shell.

### Two settings that matter

**The context window.** Claude Code doesn't know these models, so it assumes a 200k window. GPT-6-Astra actually has 272k, so `claude-proxy` sets `CLAUDE_CODE_MAX_CONTEXT_TOKENS` to match. On my Pro plan the gpt-5.6 models get 921k, so they get their own branch.

**Effort.** Claude Code lets you set effort per model in `settings.json`. I set GPT-6-Astra to medium, which is what the screenshot shows.

## How it came together

I didn't write any of this. The private-ingress-engine project's agent chain did, a main agent, a secondary and a Codex worker, from a series of my requests:

1. Set up CLIProxyAPI as a pinned, git-tracked Docker Compose stack.
2. Give me a `claude` command I can copy and test.
3. What's the easiest way to start on GPT-6-Astra?
4. Don't hard-code the model so many times, just once.
5. Keep the key in 1Password, without hard-coding the link between the env file, the proxy and Claude.
6. I still want `claude-astra`, so pull the generic part of `claude-codex` into a base.
7. Save it all into my dotfiles.

Each request reshaped the functions a bit. That last step crossed projects. My dotfiles have their own chain, so the private-ingress-engine secondary sent one request to the dotfiles secondary, the same [secondary-to-secondary rule](/posts/start-the-chain/#across-projects) from my last post. The dotfiles secondary added the six functions, checked that none clashed with existing ones and that the env file stays out of git, and smoke-tested them in a fresh shell. Then it committed them.

### Building our own anyway

Before settling on fish functions, the worker sent two sub-agents to survey what already exists. They compared 14 launchers and model switchers for Claude Code. One of them, [melonamin's claudex gist](https://gist.github.com/melonamin/fdfe168c78273820cf68346316f497ca), is very close to what we built: fish, CLIProxyAPI, a `claudex` command.

The verdict was to keep our own and borrow ideas, rather than switch to one of them. So ours stayed ours, even though it's similar.

## A cautionary tale about auto-approve

My agents run with automatic approvals. While moving the proxy to its localhost port, one of them cleaned up with an `rm` and deleted my real `config.yaml`. The API key in it was gone.

This time the blast radius was tiny. The only thing I'd changed from the default config was the key, and that lives in 1Password. Nothing was in production, and nothing got hurt. The agent apologised and saved a note to itself never to do that again.

But it's a reminder of what automatic approval means: the agent can delete files without asking. It's worth thinking about what's within reach before you turn it on.

## What's missing

Running Codex in Claude Code isn't the same as running Claude in Claude Code. Two things I use a lot are missing:

1. **Artifacts.** Claude can publish a page I can open on my phone. That doesn't work here.
2. **Claude in Chrome.** Claude drives my browser through its Chrome extension. Codex can probably operate Chrome too, but it would need something else to drive it.

## What's next

The setup is done. Now the real experiment starts: using the same model in two harnesses, and seeing where it feels different. I'll write that up once I've lived with it.
