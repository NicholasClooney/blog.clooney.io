---
draft: true

title: Remote Codex QA from My iPhone with Tailscale and tmux
date: 2025-09-28
eleventyNavigation:
  key: ssh-from-iphone-to-mac-A
excerpt: |
  How I lean on GPT-5 Codex to ship Subspace Builder updates, then double-check the site from an iPhone by jumping into my Mac with Tailscale, tmux, and `tailscale serve --https=443 http://localhost:8080`.
---

GPT-5 Codex builds the bulk of my Subspace Builder project. My job is steering the prompts, sanity-checking every deploy, and nudging the repo forward with a few well-placed git commands. Most of the time I’m literally chatting with Codex in plain language and watching it thread new ideas into the repo. To keep that loop tight, I wanted the freedom to pick up my phone, review whatever Codex just generated, and make sure the site still looks right—no matter where I am.

Inside iTerm I keep three panes going: the main pane on the left stays glued to Codex, the top-right pane holds my git shorthand (`g s`, `g aa`, `g c`), and the bottom-right pane runs `npx @11ty/eleventy --serve`. Living in tmux means that layout follows me everywhere. On the iPhone, those commands are still muscle memory—tapping out a quick `git status --short` or eyeballing the Eleventy logs is surprisingly natural on a tiny keyboard. When there aren’t errors, I jump into Safari or Firefox on the phone to double-check what Codex just published. It’s a small ritual that keeps the human review loop in the mix and lets me iterate on features or fixes the moment inspiration strikes.

## Table of Contents

[[toc]]

---

## 🧭 Why the Remote Workflow Matters

Codex handles most of the heavy lifting: layout tweaks, data files, even the Eleventy wiring. But the moment it finishes a pass, I need to:

* run `npm run dev` and eyeball the output in Safari
* stage the right files and `git status` before Codex queues the next change

Having that checklist available from an iPhone means I can keep momentum without opening the laptop. The catch? I need the Mac awake, reachable, and ready to resume exactly where Codex and I left off.

That’s the pragmatic side. Emotionally, this workflow is a quiet thrill: I can dream up a feature over breakfast, nudge Codex toward it over lunch, and iterate until it sings—without ever cracking open the MacBook lid.

---

## 🌀 First Attempt: Cloudflare Tunnel

I started with **Cloudflare Tunnel** because it seemed like the right balance of security and convenience:

* Run `cloudflared` locally.
* Wire a subdomain like `ssh.example.com` to the tunnel.
* Connect from anywhere with SSH or Mosh.

On paper, it was perfect. It’s a powerful system. Outbound-only connections mean no exposed ports, and Zero Trust policies could lock SSH behind MFA.

But in practice, it was *tricky* to set up. DNS didn’t resolve at first, configs needed polishing, and I never quite got to that satisfying `ssh user@ssh.example.com` moment. I knew Cloudflare was secure and enterprise-ready, but it felt like too much for my personal use case.

---

## ⚡ Switching to Tailscale (and Serve)

**Tailscale** was the reset I needed. Installation was straightforward, and once the Mac and iPhone joined the same tailnet, SSH just worked over the WireGuard tunnel.

The first successful ping from iPhone to Mac landed like a magic trick.

Being able to whisper `ssh nicholas@<tailscale-ip>` (or `mosh` when I’m roaming) and drop straight into my workspace felt like achieving remote presence with almost no friction.

When `tailscale serve` started proxying the Eleventy preview and handed me a tidy HTTPS URL, it let me see the live blog build from the couch, the train, anywhere with signal. Every layer that clicked into place kept doubling the delight.

The real unlock was `tailscale serve --https=443 http://localhost:8080`. With `npm run dev` running on the Mac, Serve exposes the Eleventy preview behind Tailscale’s HTTPS without touching DNS or my router. On the phone, I open the Tailscale app, tap the shared URL, and the latest Codex-generated build appears instantly.

There’s no guessing which port is open, no extra certificates to manage — just a clean way to verify Codex’s work from anywhere.

---

## 🖥 Multiplexing with tmux

Once SSH felt stable, I layered in **tmux** to keep context alive between sessions:

* A single persistent session that Codex and I share between Mac and iPhone.
* Named windows for the Subspace Builder repo, preview server, and notes.
* Pane splits that show logs, prompt drafts, and git status at a glance.
* Mouse mode so I can tap panes directly on the phone.

When I reconnect from the iPhone, tmux drops me back into the exact buffers Codex last touched. It’s like pausing and resuming a conversation without losing the thread.

I kept digging, eventually landing on `tmux -CC` so iTerm could treat the shared session like native windows. Now both the Mac and the iPhone see the same panes, the same prompts, the same diff view. It’s the dream setup I sketched in my head: a fully fledged Mac in my pocket that wakes up whenever I do.

---

## 🎨 iTerm2 + tmux + Codex

On the desktop, `tmux -CC` turns iTerm2 into a polished remote for that same session. Each tmux window becomes an iTerm tab, pane resizes stay in sync, and my custom bindings (`prefix+v` / `prefix+h`) make reorganizing Codex output painless.

Pairing that with Codex means I can ask it to refactor a layout, watch the diff appear in Vim inside tmux, and then flip to the Tailscale-served preview on my phone within seconds.

---

## 🤝 How GPT-5 Codex Fits In

This setup isn’t about writing code on a tiny screen. It’s about keeping Codex humming while I review the results:

* Codex proposes the change set and applies it locally.
* I attach from the phone, glance at `git status`, and sanity-check the preview.
* If everything looks right, I commit; if not, I feed Codex a tighter prompt.

The remote link means I’m always one `ssh` away from verifying what Codex shipped, even when I’m away from the desk.

And honestly? It makes me absurdly happy. Having Codex on call from any device, at any hour, turns flashes of curiosity into working software. AI has always accelerated my experiments, but pairing it with this remote loop amplified that feeling by 10x—maybe 100x. I can play with code, sketch ideas, and ship fixes wherever there’s connectivity. That freedom, that little spark of liberty, is what keeps me coming back to the terminal with a grin.

---

## ✅ What I Learned

* **Cloudflare Tunnel** is powerful, but it added friction to my Codex feedback loop.
* **Tailscale + Serve** let me ship Codex updates faster by exposing localhost previews in seconds.
* **tmux** keeps stateful sessions alive so I never lose Codex’s context between devices.
* **iTerm2 integration** makes the desktop comfortable while staying compatible with the iPhone workflow.

---

## 🚀 Final Setup

1. Tailscale links every device and publishes the Eleventy preview with `tailscale serve`.
2. SSH or Mosh brings me straight into the Mac wherever I am.
3. tmux manages the shared session that Codex constantly updates.
4. iTerm2 mirrors the tmux layout for a native feel on the desktop.

Now when Codex finishes a feature or blog post, I grab my phone, skim the live preview, run the git commands I need, and keep the project moving. The AI can keep building; I’m just never far from the review button.
