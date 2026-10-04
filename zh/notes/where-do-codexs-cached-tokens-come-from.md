---
title: "Codex 的缓存 token 从哪里来？"
date: 2026-05-09
tags:
  - ai
  - codex
  - openai
  - tokens
excerpt: |
  简单解释为什么 Codex 一次运行后会报告数百万缓存 token，以及提示缓存如何做到这一点。
---

Codex 运行结束后，你可能会在终端里看到这样的 token 用量明细：

```text
Token usage: total=188,614 input=173,815 (+ 5,306,112 cached) output=14,799 (reasoning 2,123)
```

`5,306,112 cached` 这个数字看起来大得惊人，几乎是实际输入的 30 倍。下面说说这是怎么回事。

[[toc]]

## 提示缓存入门

OpenAI 的提示缓存会检测 API 请求是否与最近处理过的提示具有**完全一致的前缀**。如果匹配成功，模型就会跳过这段前缀的重复计算，复用注意力层缓存的键值张量。效果是：延迟最多降低 80%，输入 token 成本最多降低 90%。

缓存自动生效，不需要配置。提示达到 1,024 个 token 后就会启用，缓存命中以 128 个 token 为增量。

> **关键限制：**必须是*完全一致的前缀匹配*。哪怕只改了提示开头的一个字符，也会让缓存失效。

## Codex 如何利用这一点

Codex 的 agent 循环在架构设计时，就把提示缓存作为核心考虑之一。

### agent 循环只追加，不修改

Codex 每次调用模型，无论是发起工具调用、理解结果还是决定下一步，都会重新发送**完整的对话历史**。循环不会修改之前的消息，只会严格地在末尾追加新内容：

```text
[system prompt] [tool defs] [env context] [turn 1] [tool call] [tool result] [turn 2] ...
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                         stable prefix -> cache hit
```

旧提示始终是新提示的精确前缀。这是有意为之。

### 稳定前缀里有什么

- 系统指令
- 工具定义
- 沙箱配置
- 环境上下文，例如工作目录、审批模式等

同一会话中的所有请求都会让这些内容保持**完全相同，顺序一致**，只追加新消息。

## 为什么缓存数量会这么大

在一次 agent 任务中，模型可能被调用几十次甚至上百次：工具调用一次，理解结果一次，每个规划步骤又调用一次。

每次调用都会重新发送完整对话历史。但由于前面的部分始终是相同的前缀，每次都会命中缓存。

所以，`cached` 总数是**单轮任务中所有推理调用的累计值**。如果 Codex 调用了模型 50 次，而会话进行到中段时，稳定前缀已经有 100k 个 token：

```text
50 calls x 100k cached tokens = 5,000,000 cached tokens reported
```

这就是为什么，即使仓库上下文并不大，单次 Codex 运行也能显示数百万个缓存 token。

## 拆解这些数字

| 字段 | 含义 |
|---|---|
| `input` | 本次运行实际处理的 token，按全价计费 |
| `cached` | 命中缓存的 token，按优惠价格计费或免费 |
| `output` | 模型生成的 token |
| `reasoning` | 内部思维链 token，仅限 o 系列模型 |

在开头的示例中，模型以全价处理了约 174k 个 token，却复用了约 5.3M 个缓存 token。这意味着实际计算量，只是不做这些优化的朴素实现所需计算量的一小部分。

## 这意味着什么

**成本**：缓存 token 便宜得多。对于包含大量工具调用的长时间 agent 会话，节省的大部分费用都来自这里。

**延迟**：缓存命中能缩短首个 token 的等待时间。Codex 在会话中途仍然响应轻快，部分原因就是模型没有在每次调用时重新处理相同的系统提示和工具定义。

**会话结构很重要**：重启会话或修改系统提示会让缓存失效，需要重新支付全价。这就是 Codex 的架构保持前缀不变、只追加内容的原因。

**`reasoning` token**：这与上面的缓存另属一回事。它们是模型进行思维链推理时使用的内部草稿 token，在 o3/o4-mini 这类模型中可见。它们不会被缓存，也不属于你看到的输出，但会占用上下文窗口。

## 延伸阅读

- [展开 Codex agent 循环](https://openai.com/index/unrolling-the-codex-agent-loop/)：OpenAI 对 agent 循环结构的深入介绍
- [提示缓存进阶](https://developers.openai.com/cookbook/examples/prompt_caching_201)：优化缓存命中率，包括 `prompt_cache_key` 参数的使用
- [OpenAI 提示缓存文档](https://developers.openai.com/api/docs/guides/prompt-caching)：保留策略、内存缓存与扩展缓存的参考资料
