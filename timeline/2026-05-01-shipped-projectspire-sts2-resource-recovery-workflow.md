---
title: "feature: ProjectSpire STS2 resource recovery workflow"
date: "2026-05-01"
time: "18:40"
parent: "/timeline/2026-04-15-idea-projectspire-mod-tooling-ideas/"
tags:
  - shipped
  - project-spire
  - games
  - modding
  - ai-assisted
  - resources
---

I worked with GPT-5.5 on a reproducible Slay the Spire 2 resource extraction plan and then landed it in [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire/) across the recovery scripts, allowlist, generated resource subset, image-format experiment, and workflow docs.

**The Principles matter** more than the files: keep the full recovered dump local and ignored, track only curated resources with a current use, make extraction scriptable instead of manual, prefer readable Python tooling, keep binary assets repo-friendly with WebP and Git LFS, and write down the decisions close to the evidence.

The implementation follows that shape by keeping `Lab/unpacked/` as the local source dump and generating `Lab/resources/` from `Lab/resources.allowlist.yaml`, starting with localization plus WebP q85 card portraits.

That gives my STS2 projects inside the [ProjectSpire](https://github.com/NicholasClooney/ProjectSpire/) monorepo access to assets like this at roughly a fraction of the original size, around 10%, without needing to commit the full recovered dump.

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/believe_in_you.webp"
    alt="Recovered Slay the Spire 2 card portrait for Believe In You"
    style="max-height: 520px; width: auto; max-width: 100%;"
  />
  <figcaption>One of the recovered card portraits from the first curated resource subset.</figcaption>
</figure>

You can find the commits/changes here: https://github.com/NicholasClooney/ProjectSpire/compare/a1fd19e...a1b6e9d