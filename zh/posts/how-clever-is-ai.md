---
title: 'AI 的边界，以及人类擅长的地方'
date: 2026-04-15
tags:
  - ai
  - ai-assisted
  - debugging
  - eleventy
  - javascript
  - subspace
  - workflow
  - yaml
---

我遇到一个小到似乎不值得关注的 bug：时间线页面中，同一天的条目没有正确排序。

页面有 `date`、`time`，以及自定义 Eleventy 集合排序。听起来问题的范围就这么大：按日期加时间排序，再反转集合，让最新的在前，结束。可 4 月 12 日却显示成了奇怪的顺序：`00:01`、`10:11`、`22:16`、`15:49`、`22:20`。

这成了一个有用的小案例，说明 AI 有多聪明，以及这种聪明在哪里会失效。Claude 很努力，语气很自信，却不断错过真正的 bug。Codex 通过运行小段 JavaScript 检查，而不是凭感觉推理，很快找到了问题。最终修复仍需要人来把握方向：从源头修正数据，再加一道足够严格的防线，让人和 AI 都无法悄悄重犯。

[[toc]]

## 这个 Bug

最初的截图显示，时间线已经按天分组，但当天内部没有正确排序。

<figure style="text-align: center;">
  <img
    alt="时间线页面显示 4 月 12 日同一天内的条目顺序错误"
    src="/assets/images/posts/how-clever-is-ai/timeline-entries-unsorted.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">可见的问题：4 月 12 日的条目被归在一起，但时间并没有按从新到旧排列。</figcaption>
</figure>

我先让 Claude 检查时间线排序逻辑。

<figure style="text-align: center;">
  <img
    alt="Claude 在终端会话中调查 Eleventy 时间线排序问题"
    src="/assets/images/posts/how-clever-is-ai/0-claude-investigating.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">Claude 大胆宣称 LGTM 👍</figcaption>
</figure>

Claude 从正确的区域开始：自定义时间线集合，以及生成的时间线 HTML。

时间线条目长这样：

```yaml
---
title: Copy buttons on long code blocks (subspace)
date: 2026-04-12
time: "22:16"
tags:
  - timeline
  - shipped
  - eleventy
  - subspace
---
```

本地 Eleventy 配置里有一个自定义时间线集合：

```js
eleventyConfig.addCollection('timeline', (collectionApi) =>
  collectionApi.getFilteredByTag('timeline').sort((a, b) => {
    const toMs = (entry) =>
      new Date(`${entry.data.date}T${entry.data.time || '00:00'}`).getTime();
    return toMs(a) - toMs(b);
  }),
);
```

模板随后反转集合，让最新内容在前：

{% raw %}

```njk
{% set logItems = collections.timeline | default([]) | reverse %}
```

{% endraw %}

乍看很合理。先升序排序，展示时反转，每个条目也都有日期和时间。

但这种“看起来合理”，正是陷阱。

## 自信地走错方向

Claude 第一轮调试做了 AI 工具常做的事：形成一个合理假设，按这个假设改代码，然后说得仿佛问题基本已经解决。

<figure style="text-align: center;">
  <img
    alt="Claude 说排序逻辑在理论上看起来正确，但输出仍然错误"
    src="/assets/images/posts/how-clever-is-ai/1-claude-s-bold-claim-LGTM!.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">危险就在这里：解释听起来连贯，页面却仍然不对。</figcaption>
</figure>

它尝试不再构造完整日期字符串，而是在 `entry.date.getTime()` 上加小时和分钟：

```js
const toMs = (entry) => {
  const [h = 0, m = 0] = String(entry.data.time || '00:00')
    .split(':')
    .map(Number);
  return entry.date.getTime() + (h * 60 + m) * 60 * 1000;
};
```

这也很合理。甚至从某个角度看更清爽：相信 Eleventy 的 `entry.date`，再加上时间线显式提供的时间。

<figure style="text-align: center;">
  <img
    alt="Claude 为时间线集合尝试另一种基于时间戳的排序修复"
    src="/assets/images/posts/how-clever-is-ai/2-claude-trying-hard-1.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">Claude 不断围绕时间戳运算迭代，却还没有找到源数据的问题。</figcaption>
</figure>

问题在于，这仍然没有真正诊断故障。它只是在用一个看起来更稳健的实现替换另一个实现，却没有证明旧实现为什么失败。

AI 的自信在这里可能很昂贵。“我看没问题”和“这下应该修好了”，只有在模型真正检查过底层假设后才有价值。

这次的假设是：`entry.data.date` **是一个日期形状的字符串。**

事实不是。

<figure style="text-align: center;">
  <img
    alt="Claude 继续修改代码，试图解决时间线排序问题"
    src="/assets/images/posts/how-clever-is-ai/3-claude-trying-hard-2.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">后面又做了更多改动，但关键问题始终没问：当集合看到日期时，它究竟是什么类型？</figcaption>
</figure>

<figure style="text-align: center;">
  <img
    alt="Claude 差一点就找到了，但我已经有些沮丧，于是转向 Codex。"
    src="/assets/images/posts/how-clever-is-ai/7-did-claude-fixed-it-question.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">Claude 差一点就找到了，但我已经有些沮丧，于是转向 Codex。</figcaption>
</figure>

## Codex 走了条朴素的路

Codex 对同一个问题采取了不同方式。它检查配置，查看生成的 HTML，再运行小段 Node 代码，核实具体的 YAML 解析行为。

<figure style="text-align: center;">
  <img
    alt="Codex 开始检查本地 Eleventy 时间线排序问题"
    src="/assets/images/posts/how-clever-is-ai/4-codex-gives-it-a-try.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">Codex 先对照了集合源代码逻辑和生成的时间线 HTML。</figcaption>
</figure>

关键验证类似这样：

```js
import yaml from 'js-yaml';

const doc = yaml.load('date: 2026-04-12\ntime: "22:16"\n');
const combined = String(doc.date) + 'T' + doc.time;
const parsed = new Date(combined);

console.log({
  dateString: String(doc.date),
  dateType: Object.prototype.toString.call(doc.date),
  combined,
  parsed: parsed.toString(),
  ms: parsed.getTime(),
  isNaN: Number.isNaN(parsed.getTime()),
});
```

它给出了 bug 的关键形态：

```js
{
  dateString: 'Sun Apr 12 2026 01:00:00 GMT+0100 (British Summer Time)',
  dateType: '[object Date]',
  combined: 'Sun Apr 12 2026 01:00:00 GMT+0100 (British Summer Time)T22:16',
  parsed: 'Invalid Date',
  ms: NaN,
  isNaN: true
}
```

<figure style="text-align: center;">
  <img
    alt="Codex 运行 Node 检查，验证 YAML 日期解析和 JavaScript Date 行为"
    src="/assets/images/posts/how-clever-is-ai/5-codex-smart-running-code-verifying.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">有用的一步：运行解析器，检查类型，证明比较器收到的数据与预期不同。</figcaption>
</figure>

Front matter 写的是：

```yaml
date: 2026-04-12
time: "22:16"
```

但在 YAML 中，不带引号、看起来像 ISO 日期的值，不一定是普通字符串。`js-yaml` 会把它解析成 JavaScript `Date`。

因此，这一行：

```js
new Date(`${entry.data.date}T${entry.data.time || '00:00'}`).getTime();
```

构造出来的不是：

```text
2026-04-12T22:16
```

而更像是：

```text
Sun Apr 12 2026 01:00:00 GMT+0100 (British Summer Time)T22:16
```

这不是有效的日期字符串。`getTime()` 返回了 `NaN`。

JavaScript 排序比较器返回 `NaN` 时，在排序意义上会被视为 `0`。条目被比较为相等，于是原有的集合／文件顺序保留下来。随后模板又反转了这个未排序的集合。

所以我看到的顺序变成了：

```text
00:01, 10:11, 22:16, 15:49, 22:20
```

而不是：

```text
22:20, 22:16, 15:49, 10:11, 00:01
```

<figure style="text-align: center;">
  <img
    alt="Codex 解释无引号的 YAML 日期如何变成 JavaScript Date 对象，并破坏比较器"
    src="/assets/images/posts/how-clever-is-ai/6-codex-with-the-right-answer.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">真正的 bug：比较器假定收到 ISO 日期字符串，但 YAML 解析后交给 Eleventy 的已经是 JavaScript Date 对象。</figcaption>
</figure>

## 人的作用：从源头修正数据

Codex 找到 bug 后，显而易见的工程修复，是让比较器同时处理字符串和 `Date` 对象。

这是个不错的防御性补丁，但我觉得它还不是完整答案。意外真正来自数据：

```yaml
date: 2026-04-12
```

对写作者来说，这看着像日期字符串；对 YAML 来说，却是一个时间戳形状的标量。

于是我问了更重要的问题：能不能从源头解决？能不能在 YAML 里提供更好的数据？

<figure style="text-align: center;">
  <img
    alt="关键的人类介入不是某行代码，而是询问数据模型本身是否应该改变。"
    src="/assets/images/posts/how-clever-is-ai/8-human-and-ai-working-together-to-find-a-solution.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">关键的人类介入不是某行代码，而是询问数据模型本身是否应该改变。</figcaption>
</figure>

答案是可以。给日期加引号，保留独立的 `time` 字段：

```yaml
date: "2026-04-12"
time: "22:16"
```

这样两个字段都保持字符串，也保留了我想要的编辑模型：

- `date` 表示条目所在的日期
- `time` 用于同一天内的排序和时间显示
- 时间线模板可以直接渲染两者

<figure style="text-align: center;">
  <img
    alt="Codex 解释最终建议：日期和时间加引号，同时保留防御性比较器"
    src="/assets/images/posts/how-clever-is-ai/9-finally-fixed.png"
    style="display: block; margin: 0 auto; max-height: 400px; width: auto; max-width: 100%;"
  />
  <figcaption style="text-align: center;">Codex 解释最终建议：日期和时间加引号，同时保留防御性比较器。</figcaption>
</figure>

源数据也有其他可能形态：

```yaml
date: "2026-04-12T22:16:00"
```

或者：

```yaml
date: "2026-04-12T22:16:00+01:00"
```

在某些系统中，这些结构更整洁，尤其是在精确时区语义重要时。但对这个网站来说，它们会对写作模型做出超出必要范围的改变。最小的源头修复，就是带引号的日期，加上带引号的时间。

## 实际补丁

最终补丁分三部分。

首先，给时间线条目数据加引号：

```yaml
date: "2026-04-12"
time: "22:16"
```

其次，集合排序仍然做防御性处理：

```js
const toIsoDatePart = (value) => {
  if (typeof value === 'string') {
    return value.split('T')[0];
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }
  return '';
};

const getTimelineSortKey = (entry) => {
  const date = toIsoDatePart(entry?.data?.date) || toIsoDatePart(entry?.date);
  const time =
    typeof entry?.data?.time === 'string' && entry.data.time.trim()
      ? entry.data.time.trim()
      : '00:00';
  return `${date}T${time}`;
};
```

再按这个字符串键排序：

```js
eleventyConfig.addCollection('timeline', (collectionApi) =>
  collectionApi.getFilteredByTag('timeline').sort((a, b) => {
    return getTimelineSortKey(a).localeCompare(getTimelineSortKey(b));
  }),
);
```

这里可以使用字符串比较，因为键有意采用 ISO 形状：

```text
YYYY-MM-DDTHH:MM
```

对于格式相同的日期时间字符串，字典序就是时间顺序。

第三，增加构建时检查器。如果未来某个时间线条目忘了给任一字段加引号，就明确报错。

检查器必须在 YAML 解析之前扫描原始 Markdown 文件。YAML 一旦解析了 front matter，引号信息就丢了。

验证器提取 front matter，读取顶层 `date:` 和 `time:` 字段，检查值是否带引号：

```js
const isQuotedYamlScalar = (value) => {
  const trimmed = String(value || '').trim();
  return (
    /^"[^"]*"\s*(?:#.*)?$/.test(trimmed) || /^'[^']*'\s*(?:#.*)?$/.test(trimmed)
  );
};
```

时间线条目有误时，构建现在会失败，并给出类似信息：

```text
Timeline entry front matter must quote date and time values so YAML does not coerce dates before sorting:
  - timeline/2026-04-12-example.md: date must be quoted (expected date: "YYYY-MM-DD")
```

最后这一步很重要。它把一个微妙、跨层的类型 bug，变成了写作时立即可见的错误。

## 这说明了 AI 的什么问题

这不是大 bug，恰恰因此才有意思。

Claude 并非没用。它找到相关代码，在正确区域推理，也提出了看似合理的改动。但它一直停留在真正问题的上一层，所以陷入困境。它试图修复排序，却没有证明比较器实际在排什么。

Codex 做得更好，是因为它把运行时当作事实依据。它不只是说“YAML 可能在奇怪地解析这个值”，而是真的运行 `js-yaml`，打印类型，构造字符串，用 `new Date` 解析，然后看到了 `NaN`。这一步小小的验证，迅速缩小了搜索范围。

教训不是“Codex 好，Claude 差”。教训是，自信很便宜，而插入检查、取得证据，值得付出成本。

当 AI 说：

- “我看没问题”
- “这应该能修好”
- “逻辑是正确的”

我现在会在心里补上一句：

> ……除非……它做了**未经验证的假设**。

这真是一个我们也传给了 AI 的人类特征。

## 关于 TypeScript 的想法

这里还有一个类型角度。

Bug 出现，是因为代码非正式地假定：

```ts
entry.data.date: string
entry.data.time: string
```

但运行时的值更接近：

```ts
entry.data.date: Date
entry.data.time: string
```

普通 JavaScript 没有抱怨，因为没有什么机制让它抱怨。模板渲染了可读日期，集合回调运行了，比较器返回了一个看似数字的值，只不过是 `NaN`，排序便静静保留原来的顺序。

TypeScript 本身不会自动拯救这个网站。内容来自 Markdown front matter，因此边界处仍是运行时数据。但 TypeScript 加上真正的内容 schema，可以把假设写明确：

```ts
type TimelineEntry = {
  date: string;
  time: string;
};
```

这样，在集合代码接触数据之前，网站就能将 Markdown front matter 验证成这个形状。未来更强的版本，可以把时间线校验从临时正则移到一个小型、带类型的内容加载器或 schema 检查中。

不过，当前检查器有意保持简单。它只防住实际发生过的错误：

- 时间线条目必须有 `date`
- 时间线条目必须有 `time`
- 两者在源文件中都必须带引号
- 不符合就构建失败

有时，最小的防线比更大的抽象更好。

## 真正的工作流

最终结果不只是“AI 修好了一个 bug”。

它是一个循环：

1. 人发现了可见的排序问题。
2. Claude 探索了相关区域，但困在看似合理的修复中。
3. Codex 用小段 Node 检查验证运行时假设。
4. 人推动从源头保证数据正确。
5. Codex 在本地和上游仓库都应用最小修复。
6. 构建增加验证器，防止以后再犯同样错误。

这是我最信任的 AI 工作流：它不是神奇的答案盒子，而是能快速检查、测试和解释的伙伴；人则持续把握解决方案应有的形态。

有趣的是，bug 来自合法 YAML 完全按照其允许的方式工作。代码看起来也合理，模板也照指令执行。每一层单独看都说得通。

故障藏在它们之间的缝隙里。

好的调试就在这里发生。而越来越多时候，好的 AI 协作也发生在这里。

## 附录：这篇文章如何写成

这篇文章还有一层关于自身的故事：它是在同一个调查会话里，与 Codex 一起写成的。

我提供了想要的结构：发现一个“简单”bug 的开发日志；Claude 陷入困境与 Codex 验证假设的对比；人推动从源头修数据的介入；关于 TypeScript 的思考；以及构建时检查器。Codex 按这个提纲完成了大部分初稿，使用的就是刚刚调试时间线时梳理过的技术细节。

这既有用，又略微奇怪。文章不是原始对话记录，而是由我塑形、编辑和定方向。但大量实际文字，确实来自刚刚帮我修好 bug 的同一个工具。写作过程映照着工程过程：我设定方向、提供判断、修正细节，决定哪些内容应该留下；Codex 承担繁重工作。

### 旁记：失去肌肉

在[《什么值得保留：AI 时代，何以为人》](/zh/posts/whats-worth-keeping-on-humanness-in-the-age-of-ai/)中，我写到自己属于键盘一代，因此失去了一部分手写汉字的能力。我仍能熟练输入中文，但写字的身体记忆已经淡去。

我能想象，细致写作也会发生同样的事。如果一直用 AI 起草、重写、组织和润色，也许有一天，自己的写作肌肉会变弱。也许会失去那种坐在空白页前，亲自组织句子带来的流畅感。

只要技术还在，这未必是坏事。键盘改变了手写，拼写检查改变了拼写，搜索改变了记忆。但 AI 很可能会改变我们所做的一切。

所以，令人不安的问题是：如果技术不再可用，会怎样？如果模型消失、账户被锁、网络中断、公司倒闭，或工具变得太贵，还剩下什么？

我还能写作、工作、编程、创造吗？

你呢？

我们作为人类，还能吗？

这大概才是这一切下面更深的问题。
