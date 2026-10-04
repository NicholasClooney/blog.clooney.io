---
title: 在本地预览生产环境中的草稿处理效果
date: 2025-09-28
tags:
  - eleventy
  - drafts
  - workflow
excerpt: |
  所有 npm 脚本现在都接入了 `ELEVENTY_ENV`，让草稿在生产环境中保持私密，同时方便本地预览。
---

## 草稿不会进入生产环境

我们现在为 Subspace Builder 自带的每个 npm 脚本设置了 `ELEVENTY_ENV`。运行 `npm run build` 时，Eleventy 会过滤掉所有标记为 `draft: true` 的 Markdown 文件，避免未完成的文章出现在正式网站上。

想确认网站在生产环境中的表现？可以使用新的 `npm run prod` 命令。它会以生产环境配置启动 Eleventy 开发服务器，让你在本地检查正式发布的效果，同时继续享用热重载。

## 有哪些变化

- Eleventy 根据当前的 `ELEVENTY_ENV` 计算 `eleventyExcludeFromCollections`；值为 `production` 时，会跳过草稿模板。
- `package.json` 中的脚本现在覆盖了完整流程：用 `npm run dev` 写草稿，用 `npm run prod` 预览生产效果，用 `npm run build` 生成可部署的输出。
- README 介绍了这些新脚本，方便大家采用这种由环境变量控制的行为。

这些基础改动让发布测试更顺畅，也让内容编辑流程更整洁。
