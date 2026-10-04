---
title: 为我的 Eleventy 博客点亮 GitHub 代码嵌入
date: 2025-10-03
tags:
  - eleventy
  - github
  - shortcodes
  - code-embeds
---

很长一段时间里，分享 GitHub 代码就意味着截图，或把原始片段粘贴进 Markdown。这两种方式都不太可靠：截图让 RSS 阅读器看不到文本，复制粘贴的代码又会在上游文件一改动时失去同步。我想要 Emgithub 的可读性、服务端渲染带来的 SEO 优势，以及完全不依赖第三方 JavaScript。

这周，这几项终于凑齐了：一个 `{% raw %}{% github %}{% endraw %}` 短代码，在构建时获取代码，完成高亮、行号和复制按钮。它只需要 GitHub blob URL，以及一个可选的明暗界面样式参数。

[[toc]]

## 目标和约束

在让 GPT Codex 写代码之前，我先定了几条边界：

- **适合构建时处理。** 所有内容都应在 Eleventy 构建期间完成，让生成的 HTML 已经包含代码，对搜索引擎、RSS 和离线阅读器都友好。
- **缓存远程请求。** 反复获取 GitHub 原始文件会很慢，因此由 EleventyFetch 处理缓存。
- **保持简单的写作体验。** 短代码应接受大家熟悉的 GitHub “blob” URL，包括可选的 `#L10-L42` 行范围片段标识。
- **契合网站外观。** 我借鉴了 Emgithub 的视觉语言：上方是文件信息，下方是代码行；再用自己的 CSS 融入 Subspace 主题。

## 解析 GitHub URL

第一个组成部分是一个小解析器，将 GitHub blob URL 拆解成可用的信息。它提取用户、仓库、分支、文件路径，以及 URL 片段标识中的行范围。

{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/5e7ae27a30f04c1d6c2bf281de97b29cdccd602d/eleventy.config.js#L19-L46" %}

没有片段标识时，短代码会渲染整个文件。传入包含 `#L8-L25` 的 URL，就只渲染这些行；GitHub 自带的永久链接界面让获取这种 URL 很方便。

## 在构建时获取并高亮

取得元数据后，EleventyFetch 会在构建期间获取原始文件内容。结果缓存 24 小时，让增量构建保持快速。

{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/5e7ae27a30f04c1d6c2bf281de97b29cdccd602d/eleventy.config.js#L203-L209" %}

接着由 Highlight.js 高亮代码。我根据文件扩展名识别语言；当 highlight.js 不认识该语法时，就退回纯文本。

{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/5e7ae27a30f04c1d6c2bf281de97b29cdccd602d/eleventy.config.js#L212-L222" %}

将每一行放进有序列表，就能获得有语义的行号，无需客户端脚本：

{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/5e7ae27a30f04c1d6c2bf281de97b29cdccd602d/eleventy.config.js#L224-L234" %}

## 借鉴 Emgithub 的样式与剪贴板支持

这些 HTML 最终放进一个仿照 Emgithub 窗口的容器，不过样式现在由项目本地维护。独立的样式表通过 CSS 变量处理明暗主题，一小段 `copy.js` 脚本则让 “Copy” 按钮真正执行剪贴板操作。

{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/5e7ae27a30f04c1d6c2bf281de97b29cdccd602d/eleventy.config.js#L242-L255" %}

点击按钮会复制已经渲染的代码行，并显示一秒钟的 “Copied!” 标签，让读者知道复制成功。

## 使用短代码

全部接好后，嵌入片段只需粘贴 URL，再选择主题修饰参数。短代码默认使用浅色样式，因此样式参数完全可选。

{% raw %}

```njk
{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/main/index.njk" %}

{% github "https://github.com/TheClooneyCollection/11ty-subspace-builder/blob/main/index.njk#L1-L11" "dark" %}
```

{% endraw %}

由于 HTML 在服务端生成，代码在 RSS、打印以及禁用 JavaScript 的阅读器中依然可见。我也打算在引用代码时使用 GitHub 的 “Copy permalink” 按钮，将 URL 固定到某个提交哈希，避免仓库演进时文章内容跟着变化。

## 测试与体会

Eleventy 构建是这里主要的测试手段。运行 `npm run build`，可以确认短代码能获取远程代码、完成高亮，并生成无警告的有效 HTML。之后只要打开本地预览，点击复制按钮，再浏览输出，确认样式与主题一致即可。

各个部分到位后，这个功能显得如此小巧，让我很喜欢。Eleventy 的异步短代码让构建时获取数据很容易接入，Highlight.js 则省去了手工维护语言定义的麻烦。最重要的是，写作流程简单到只需粘贴一个 GitHub 链接，完全符合我最初构思时的期待。

如果你试用了这个功能，或对自动检测网站主题有想法，欢迎告诉我。我很想继续改进 Subspace Builder 的代码展示方式。
