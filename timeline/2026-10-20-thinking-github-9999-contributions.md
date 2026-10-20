---
title: "thoughts: Catching 9,999 GitHub contributions"
date: "2026-10-20"
time: "15:13"
tags:
  - thinking
  - github
  - personal
---

<figure style="text-align: center;">
  <img
    src="/assets/images/timeline/github-9999-contributions-2026-10-20.png"
    alt="GitHub contribution graph showing exactly 9,999 contributions in the last year, captured on October 20, 2026."
    style="width: 100%; height: auto; border-radius: 8px;"
  />
  <figcaption>A lucky moment to catch: 9,999 contributions in the last year.</figcaption>
</figure>

Caught my GitHub contributions at exactly 9,999 in the last year today. Wasn't aiming for it. What a number to catch!

I pulled the public-repository breakdown a little later, by which point the total had reached 10,017. This API snapshot covers `2025-10-18T23:00:00Z` to `2026-10-20T22:59:59Z`. The 27 public repositories below account for 7,889 contributions; this is not a breakdown of the earlier 9,999 in the screenshot. These counts include commit, pull request, and repository creation contributions.

| Repository | Contributions |
| --- | ---: |
| [NicholasClooney/blog.clooney.io](https://github.com/NicholasClooney/blog.clooney.io) | 4,743 |
| [NicholasClooney/project-stone-age](https://github.com/NicholasClooney/project-stone-age) | 854 |
| [TheClooneyCollection/EDControlRoom](https://github.com/TheClooneyCollection/EDControlRoom) | 649 |
| [TheClooneyCollection/tmux-agents](https://github.com/TheClooneyCollection/tmux-agents) | 261 |
| [TheClooneyCollection/dotfiles](https://github.com/TheClooneyCollection/dotfiles) | 258 |
| [TheClooneyCollection/11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder) | 235 |
| [TheClooneyCollection/itslam-web](https://github.com/TheClooneyCollection/itslam-web) | 234 |
| [NicholasClooney/ProjectSpire](https://github.com/NicholasClooney/ProjectSpire) | 185 |
| [TheClooneyCollection/project-resume](https://github.com/TheClooneyCollection/project-resume) | 150 |
| [TheClooneyCollection/project-etho](https://github.com/TheClooneyCollection/project-etho) | 128 |
| [NicholasClooney/ProjectDawn](https://github.com/NicholasClooney/ProjectDawn) | 80 |
| [NicholasClooney/ghostty-theme-picker](https://github.com/NicholasClooney/ghostty-theme-picker) | 30 |
| [TheClooneyCollection/ansible-macOS-playbook](https://github.com/TheClooneyCollection/ansible-macOS-playbook) | 22 |
| [TheClooneyCollection/private-ingress-engine-template](https://github.com/TheClooneyCollection/private-ingress-engine-template) | 10 |
| [NicholasClooney/little-snitch-review-kit](https://github.com/NicholasClooney/little-snitch-review-kit) | 10 |
| [NicholasClooney/SwiftyBites](https://github.com/NicholasClooney/SwiftyBites) | 9 |
| [NicholasClooney/Shapez2-Blueprints](https://github.com/NicholasClooney/Shapez2-Blueprints) | 7 |
| [NicholasClooney/cloudflare-email-to-webhook-worker](https://github.com/NicholasClooney/cloudflare-email-to-webhook-worker) | 7 |
| [TheClooneyCollection/ansible-project-lighthouse](https://github.com/TheClooneyCollection/ansible-project-lighthouse) | 4 |
| [TheClooneyCollection/codex-prompts](https://github.com/TheClooneyCollection/codex-prompts) | 3 |
| [demonixis/oxrsys](https://github.com/demonixis/oxrsys) | 3 |
| [NicholasClooney/fork-OpenXR-OSX](https://github.com/NicholasClooney/fork-OpenXR-OSX) | 2 |
| [vladkens/macmon](https://github.com/vladkens/macmon) | 1 |
| [TheClooneyCollection/ansible-role-umami](https://github.com/TheClooneyCollection/ansible-role-umami) | 1 |
| [jaxxstorm/sentinel](https://github.com/jaxxstorm/sentinel) | 1 |
| [NicholasClooney/fork-VeRantyx](https://github.com/NicholasClooney/fork-VeRantyx) | 1 |
| [NicholasClooney/fork-tailscale-sentinel](https://github.com/NicholasClooney/fork-tailscale-sentinel) | 1 |
| **Public-repository subtotal** | **7,889** |

The 4,743 commit contributions for [my blog](https://github.com/NicholasClooney/blog.clooney.io) stand out. I write and push frequently, but I suspect the bigger factor is how I keep it in sync with [Subspace](https://github.com/TheClooneyCollection/11ty-subspace-builder), which the blog is based on: whenever Subspace updates, I rebase the blog and force-update it. Rebasing changes commit IDs, and my guess is that GitHub may be counting rewritten commits as new contributions. That's a personal hunch, not a verified explanation of GitHub's counting mechanism, and I wouldn't read that number as 4,743 distinct pieces of new work.
