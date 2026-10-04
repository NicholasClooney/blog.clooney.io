---
title: Subspace Builder 支持自动生成目录了
date: 2025-09-27
tags:
  - eleventy
  - automation
  - table-of-contents
excerpt: |
  用 Markdown 自动生成目录，减少手动编辑，保持锚点一致，也让发布更快。
---

## 我为什么在意目录

目录就像每篇文章的简图。读者可以立刻了解文章的大致内容，直接跳到想看的章节，不必一直滚动页面。我在这里写的大多是操作指南、发布说明或深入分析，有这样一张全局地图，读者就不容易迷路。

## 目录

[[toc]]

## 痛点：手动让 ChatGPT 生成目录

在今天之前，我会把每篇草稿放进浏览器里的 ChatGPT，让它生成 Markdown 目录，再把结果粘贴回文章。一开始还好，后来问题就来了。助手偶尔会用与网站不同的规则把标题转成 slug，导致生成的链接无处可去。修正这些不一致又要来回编辑，繁琐到让我怀疑目录到底值不值得做。

## 预期与现实

我原以为，在项目里实现目录自动化至少需要一小时：写些自定义解析逻辑，可能还要加过滤器，再做一堆测试。实际只改了十分钟。把 `markdown-it-toc-done-right` 接到现有 Eleventy Markdown 处理流程里，与 `markdown-it-anchor` 配合，一切就正常工作了。

## 背后的实现

配置改动在 `eleventy.config.js` 中。锚点插件和 `markdown-it-toc-done-right` 现在共用一个 `slugify` 辅助函数，因此每个标题 ID 和目录链接都保持同步。作者只需在 Markdown 文件的任意位置放入 `[[toc]]`，Eleventy 就会自动把标题渲染成一个 `<ul>`。不需要额外短代码，也不需要后处理脚本。

```js
const md = new MarkdownIt({ html: true, linkify: true })
  .use(MarkdownItAnchor, {
    slugify,
    permalink: MarkdownItAnchor.permalink.ariaHidden({
      class: 'header-anchor',
      placement: 'before',
    }),
  })
  .use(MarkdownItTocDoneRight, {
    containerClass: 'toc',
    listType: 'ul',
    level: [2, 3],
    slugify,
  });
```

## 发布这次更新

新流程很简单：在需要大纲的地方加入 `[[toc]]`，执行构建，剩下的交给 Eleventy。不用再从聊天机器人那里复制粘贴，不用再修复失效的锚点，读者也终于能看到我一直想提供的结构化概览。有时，最好的开发体验改进，花的时间比你预计的还少。
