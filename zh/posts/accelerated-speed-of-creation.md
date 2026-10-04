---
title: "创作正在加速"
date: 2026-04-17
tags:
  - ai
  - ai-assisted
  - workflow
  - personal
  - reflection
---

过去这一周，我在代码和写作两方面交付的速度，放在 AI 之前简直不敢想。意外的是，我并没有忙得团团转，只是从想法到成品之间的阻力少了。真的像在以曲速工作，😜。

[[toc]]

## 加速的一周

看看这个。这是我一周内已经交付的内容，而且还在增加（[完整列表在这里](/timeline/weeks/2026-W16/)）：

```
(newest)
- feature: Collapsible Markdown code blocks (subspace)
- feature: Timeline archive pages (subspace)
- blog: The Accelerated Speed of Creation
- feature: Theme mode control and delayed previews (subspace)
- blog: rtc-bridge — TCP tunneling from a browser, explained
- skill: Editorial workflow and frontmatter skills
- note: WebRTC — How it actually works
- note: Smart AI Token Consumption
- blog: Getting Pulled Into the Ethereum Ecosystem
- feature: Published the first threaded timeline update
- wip: ProjectSpire Lab decompile setup
- wip: moving the Cloudflare Email Worker into Git
- feature: Recursive git-activity
- skill: Timeline-entry skill
- blog: The Limits of AI and Where Humans Shine
- skill: Release skill for Subspace
- idea: ProjectSpire mod tooling directions
- thoughts: What's Worth Keeping: On Humanness in the Age of AI
- feature: Shipped the timeline page
- feature: Random month navigation on Project Etho
- thoughts: A Small Digital Garden That Feels Like Home
- feature: OG image support for Chinese text (subspace)
- note: Homemade Hash Browns, Two Ways
- blog: Cloudflare Build Notifications via Email Routing and Email Worker
- feature: Copy buttons on long code blocks (subspace)
- feature: Auto theme-switching code blocks and GitHub embeds (subspace)
- feature: Notes collection with OG images (subspace)
- thoughts: Hello, timeline
(earliest / the beginning of time...line...)
```

功能上线了，博文发布了，笔记写好了，技能也编码成了规则。跨越多个仓库、多个技术领域、多种思考方式。

现在，有一件事我想让你停下来想一想。

**我并不忙，至少没有太忙。**

---

## 以前的瓶颈并不是想法

我一直有想做、想写的东西。大多数最终没能问世。也不完全是没时间，更像是每个想法都自带一堆机械事务，悄悄在行动开始前就消磨了动力。

想写一篇博客？还得整理 front matter、决定 slug、想清楚文件放哪儿、暂存修改、写一条真正描述所做事情的提交消息，再推送。而这些都发生在你*写完之后*。

想发布一个小功能？同样的流程，还要加上样板代码、发布说明，以及更新所有需要反映变更的文档。

每次创作都要交一笔税。单看每件事，这笔税并不大。但二十件事加起来呢？足以让你做完五件就停下，甚至三件，或者索性不开始。

**现在，这笔税消失了。**

---

## 工作的三个层次，AI 接手了最底层

我开始把创作分成三个层次：

**思考**是无法削减的人类部分。想法本身，切入角度，这个功能为什么重要，这篇博文真正想说什么，哪个问题值得解决。这一层谁都无法外包，就算可以，我也不愿意。这是**我的**，也是定义我的东西。

**打磨**是把思考转化为形式。组织论证、选择恰当的表达框架、审阅生成内容并不断塑形，直到听起来像自己。这一层仍然需要真正的注意力，但 AI 已经成了切实的合作者：根据提纲起草，补全骨架，建议结构。打磨这一层被压缩了，并没有消失。

**机械事务**是其余一切。样板代码、front matter、提交消息、分支管理、应用模板、创建文件骨架、生成时间线条目。Add、commit、push、开 PR。

很长时间里，这三层全都由我来做。现在，机械事务几乎完全有人代劳了。而事实证明，它以前默默吞掉的创作精力，比我估计的多得多。

---

## 实际是怎么做的

### 写作

想写东西时，我会把想法说出来。不一定真的拿着麦克风口述，而是解释我的想法、结构，以及希望传达的核心观点。我给 AI 打好基础：我知道什么、从哪个角度切入、什么最重要。它填充正文，我再审阅、调整、删减、磨得更锋利。

成品读起来像我，是因为思考是我的，想法也是我的。AI 处理了那种盯着空白文档、琢磨第二段该怎么起头的部分。如果你写过东西，就知道这部分占用的时间常常大得不成比例。

### 功能与发布

我也用 AI 做功能，比如你正在看的这个数字花园。因为是个人网站，我有意把工程标准放宽一些：只要能用、感觉对，即使有点粗糙、组织得不够完美，我通常也能接受。这大大加快了迭代。我描述需求，让 agent 实现，再审阅结果是否达到自己的标准。

这只适用于这类个人项目。面对生产级工程，我的要求要高得多：流程中要有自动化工具、更严格的检查，以及更严谨的审阅，因为粗心的代价显然高得多。

另外，为了处理博客功能开发中的杂活，也就是发布，以及一部分写作工作，我积累了[一些技能](/zh/notes/encoding-my-blog-workflow-for-coding-agents/)。它们把工作流说明和约定编码下来，让 agent 能处理反复出现的维护事务，不用我每次会话都重新解释同一套流程。

时间线条目就是个好例子。它不算真正的写作，也不算功能开发，更接近 Git 操作和仓库维护：围绕实际交付成果必须完成的杂活。我可以说“根据这个页面，为最近的 Subspace 版本写一条时间线”，agent 就会读取素材，套用正确格式和元数据，放到正确文件里，作为整体维护流程的一部分准备好。以前需要十分钟机械跟进的事，现在只需十秒钟交代。

### Git 操作

这一点最让我意外。我几乎已经不再手动做 Git 操作。Add、commit、push、分支管理、创建 PR，全都有人处理。我把它交给了一个[更小、更便宜的模型](/zh/notes/smart-ai-token-consumption/)，因为机械层不需要重度推理，只需要可靠，它就能处理整套流程。

当然也有例外：重写历史、复杂 rebase，或者其他需要认真思考工作树会怎样变化的情况，我仍会亲自配合更强的模型处理。但日常 Git 操作？已经从我的任务清单里消失了。

这里有一个值得明说的认识：AI 委派并不是一回事。你可以聪明地选择让*哪个*模型处理*哪一层*。日常机械任务不需要最好的模型，把强大的推理能力留给真正需要的工作。

---

## 真正改变了什么

这一周最打动我的，不是数量，而是列表里**没有哪件事让我觉得是在苦熬**。

每一项都发布了，是因为我想发布，而不是因为我终于咬牙克服了阻力。过去常死在“我应该做这个”与“好吧，但那意味着我还得做*这么一堆事*”之间的想法，现在就这么……活过来了。它们被做出来了。

这并不意味着思考更少。如果说有变化，那就是我想得更多了，因为[**思考是留给我们人类的事**](/zh/posts/whats-worth-keeping-on-humanness-in-the-age-of-ai/)。想法再也没有借口可以躲在后面；东西没做出来时，也没有阻力可怪了。

创作的上限，从来不是我有多聪明，或有多少小时，而是那些额外负担。现在，负担消失了。

---

## 这篇文章试了三次

这是这篇文章的第三个版本。

第一次失败的尝试仍然保留着，叫[《把我的博客工作流编码给编程 agent》](/zh/notes/encoding-my-blog-workflow-for-coding-agents/)，作为反例放在笔记里。它作为机制记录很有用，却不是我真正想写的文章。

第二稿被我彻底扔掉。严格说它没错，但没能让我产生共鸣，所以没有留下。

就连现在这个版本，也经历了多轮校对和重塑，才终于像是我要写的那篇。

这对我很重要。AI 能让我更快写出草稿，但仍然不能替我决定：哪个版本足够真实、足够锐利、足够有生命力，值得留下。

---

## 需要坦诚说明的一点

我想说清楚，这不意味着什么。AI 并不是生成了一篇与我毫无关系的文章，然后我就拿来发表。思考是我的，视角是我的。决定什么值得做、哪个角度有意思、什么真实、什么不真实的人，仍然是我。编辑判断完全属于人。

改变的是，“我有一个想法”和“这个想法已经来到世界上”之间的距离骤然缩短。机械事务税被取消了。而这笔税，原来比我过去承认的大得多。

原本需要一个月的工作，一周就完成了。原本会一直停留在笔记里的一个月的想法，如今变成了成品。就是这种感觉。

我觉得，我们还没有充分消化这一切意味着什么：人们如何创造，创造什么，创造多少，以及当额外负担不再构成限制时，创作工作究竟会是什么样。

我还在摸索。但这一周已经说明了很多。
