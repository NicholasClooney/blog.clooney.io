---
title: "feature: Code block wrap controls (subspace)"
date: "2026-05-07"
time: "12:09"
tags:
  - shipped
  - subspace
  - code-blocks
  - github-embeds
  - markdown
---

I shipped [v1.33.0](https://github.com/TheClooneyCollection/11ty-subspace-builder/releases/tag/v1.33.0) of [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder), adding wrap toggles to Markdown code blocks and GitHub embeds. Markdown code blocks now wrap by default, including Markdown files rendered through GitHub embeds, while collapsed GitHub embeds still allow long lines to scroll horizontally. I also added a draft regression page for long GitHub and Markdown code lines so this behavior has a concrete page to test against.
