---
title: 用 Satori 和 GPT-5 Codex 做出社交分享卡片
date: 2025-09-26
tags:
  - eleventy
  - automation
  - og-images
  - social-preview
---

我一直很喜欢 iMessage 或 WhatsApp 把分享链接自动变成小明信片的效果。直到这周，这种魔法对我来说还是个黑箱。我猜背后肯定有开放标准，但从没亲手接入过。于是我和 GPT-5 Codex 来了一次结对开发，大约两小时后，11ty Subspace Builder 就能为每篇文章生成带有自己品牌风格的预览了。

下面是本文的一张示例卡片。

<img
  alt="Subspace Builder 生成的社交分享卡片示例"
  src="/assets/images/subspace/social-cards/social-cards.png"
/>

## 目录

[[toc]]

## 弄清规范

所谓的“标准”，主要就是 Open Graph（Facebook/Meta）和 Twitter 卡片元标签。抓取程序会寻找 `<meta property="og:image">` 及相关标签，只要提供一张尺寸约为 1200×630、带绝对地址的图片，消息应用就会愉快地显示出来。理论上很简单，难的是把这些图片真正生成出来，而且让它们看起来经过认真设计。

我梳理了几种选择：

- 在无头浏览器中渲染 HTML，再截图，例如 Puppeteer/Playwright。
- 调用 Cloudinary 或 Bannerbear 之类的第三方 API。
- 用 Canvas/Sharp 画矩形。
- 用 Satori + Resvg，把类似 React 的组件转成 PNG。

对于小博客，构建时静态生成最合适。没有运行时成本，品牌视觉稳定，而且每次内容变化本来就会重新构建。GPT-5 Codex 建议我选择 Satori + Resvg：纯 Node，启动快，表达能力也足以实现我想要的布局。

## 设计流水线

动手之前，我们先规划了几个部分：

1. **共享摘要辅助函数。** 网站原本就有一个 Eleventy `excerpt` 过滤器。为了避免重复，我们把它提取到 `lib/excerpt.js`，让 Eleventy 和生成器使用同一套逻辑。
2. **生成器脚本。** 新增的 `scripts/generate-og-images.js` 读取每篇 Markdown 文章，用 Markdown-It 渲染 Markdown，提取标题和摘要，再传给 Satori HTML 模板。Resvg 将 SVG 转成清晰的 PNG。
3. **字体与品牌风格。** 我们通过 `@fontsource` 选择 Lexend 作为标题字体，Inter 作为正文字体。模板采用 Sun 主题配色，以暖黄色渐变搭配琥珀色点缀，让卡片保持统一风格。
4. **缓存。** 每篇文章的标题、摘要和模板版本会一起计算哈希，写入清单。没有变化就跳过重新生成。还有 `--force` 标志或 `OG_FORCE=true`，方便调整设计时清掉缓存。
5. **输出存放位置。** PNG 存入 `assets/og/`，清单 JSON 存在 `_data/ogImages.json`。Eleventy 会将它作为全局数据，供后续引用。

## Satori 中的自适应排版

第一版看起来很棒，直到一个长标题把所有东西挤出了画布。Satori 不会自动缩放文字，所以我们加入了一个简单的适配函数：设置几个字号档位，每档对应最大字符数；标题还是放不下，就在最后截断。摘要也采用相同模式。这不是 AI，只是一段简洁的 switch 逻辑，却能让布局保持整齐。

把标记交给 Satori 之前，我们还会清理仅含空白的文本节点，否则它会把空白节点算作额外子元素，并抛出“Expected `<div>` to have display:flex”错误。

## 接入 Eleventy

图片有了，还需要让 Eleventy 知道它们。`posts/
posts.11tydata.js` 中一个很小的计算值会查找 `_data/ogImages.json` 里对应的条目，并将 `ogImage` 注入页面数据。任何文章都能手动覆盖它，但默认会有自动生成的路径。

我们也把生成器接进了构建流程：`eleventy.config.js` 在 `eleventy.before` 事件中运行 `generateOgImages()`。在我们的 CI 环境 Cloudflare Pages 上，设置 `OG_FORCE=true` 就能确保全部刷新。

为了让开发更顺手，我们还加入了：

- `eleventyConfig.addWatchTarget("assets/og/")` 和 `.cache/og/`，让 PNG 的变化触发 Eleventy 的文件监听。
- 专用 npm 脚本 `npm run og`，方便只重新生成卡片，不必构建整个网站。
- 一段清楚易懂的 `README` 说明，介绍流程，也解释为何选择 Satori 而不是 Puppeteer。

## 更新 Head 标签

事实证明，光有图片还不够。基础 Nunjucks 布局现在会组装完整的 `<head>`：

- 标题结合文章标题和网站标题，例如“Post No. 1! · 11ty Subspace Builder”。
- 描述优先取 front matter，其次是摘要，最后是网站描述。
- 规范网址以及 `og:url`/`twitter:url`，由 Eleventy 的 `page.url` 加上网站根地址生成。
- 位于 `/posts/` 下的内容，`og:type` 会切换为 `article`。
- 只要存在 PNG，Twitter 卡片就升级为 `summary_large_image`。

这样整个网站的元数据都保持一致，包括没有生成图片的页面。

## 与 GPT-5 Codex 合作

没有 Codex，我不可能这么快做完。我基本上只是把猜想抛给它，比如“消息应用应该是用 OG 标签”，它就有条不紊地梳理架构、写出第一版脚本，甚至在我完全理解报错之前就发现了 Satori 的空白节点边界情况。每次我问“为什么输出里看不到 `og:image`？”，我们都会一起追查，直到弄明白。身边有一个熟悉 11ty 生态和 Node 细节的 AI 搭档，实在省了太多时间。

## 接下来

社交分享卡片已经做好，接下来我想探索：

- 从 `_data/themes.yaml` 动态读取主题色，让不同文章展示不同配色。
- 为主页和标签归档生成预览。
- 在 CMS 写作界面中显示 OG 图片，让我在发布前就能预览卡片。

如果你也在折腾 11ty，想要有品牌风格的社交预览，又不想引入沉重的运行时，Satori + Resvg 是个很好的起点。尤其是你身边也有 GPT-5 Codex 的时候。

准备好把它放进仓库时告诉我，我可以帮忙安排文件位置或调整 front matter。
