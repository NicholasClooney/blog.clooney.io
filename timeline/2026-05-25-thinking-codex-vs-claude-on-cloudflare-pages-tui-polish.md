---
title: "thoughts: Codex vs Claude on Cloudflare Pages TUI polish"
date: "2026-05-25"
time: "08:49"
parent: "/timeline/2026-05-06-thinking-codex-vs-claude-code-for-projectspire/"
tags:
  - thinking
  - cloudflare
  - ai-agents
  - ai-assisted
  - tooling
---

I've been iterating on `scripts/check_cloudflare_pages.py`, and this one ended up being a pretty clean example of where Claude currently feels stronger than Codex for TUI / UI design.

Codex got the script started and helped shape the core deployment-status workflow, but when it came to making the terminal output feel actually polished, especially across both the short and verbose views, Claude was noticeably better. At its best Codex still seems to struggle a bit with this kind of presentation work, so I ended up handing the UI pass over to Claude even though Codex had started the script.

<figure>
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="text-align: left; padding: 0.5rem;">View</th>
        <th style="text-align: left; padding: 0.5rem;">Codex</th>
        <th style="text-align: left; padding: 0.5rem;">Claude</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="vertical-align: top; padding: 0.5rem;"><strong>Short version</strong></td>
        <td style="padding: 0.5rem;">
          <img
            src="/assets/images/timeline/cf-pages-deployment-status-script/gpt-version.jpg"
            alt="Short terminal output version of the Cloudflare Pages deployment status script produced with Codex"
            style="display: block; width: 100%; height: auto; border-radius: 8px;"
          />
        </td>
        <td style="padding: 0.5rem;">
          <img
            src="/assets/images/timeline/cf-pages-deployment-status-script/claude-version.jpg"
            alt="Short terminal output version of the Cloudflare Pages deployment status script produced with Claude"
            style="display: block; width: 100%; height: auto; border-radius: 8px;"
          />
        </td>
      </tr>
      <tr>
        <td style="vertical-align: top; padding: 0.5rem;"><strong>Verbose version</strong></td>
        <td style="padding: 0.5rem;">
          <img
            src="/assets/images/timeline/cf-pages-deployment-status-script/gpt-verbose-version.jpg"
            alt="Verbose terminal output version of the Cloudflare Pages deployment status script produced with Codex"
            style="display: block; width: 100%; height: auto; border-radius: 8px;"
          />
        </td>
        <td style="padding: 0.5rem;">
          <img
            src="/assets/images/timeline/cf-pages-deployment-status-script/claude-verbose-version.jpg"
            alt="Verbose terminal output version of the Cloudflare Pages deployment status script produced with Claude"
            style="display: block; width: 100%; height: auto; border-radius: 8px;"
          />
        </td>
      </tr>
    </tbody>
  </table>
  <figcaption style="text-align: center;">Short and verbose output passes for the same Cloudflare Pages deployment-status script, comparing Codex against Claude.</figcaption>
</figure>
