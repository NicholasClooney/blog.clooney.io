---
title: "\"Can you believe this?\" — The Tailscale Setup That Gave Me Absolute Freedom"
date: 2025-10-14
eleventyNavigation:
  key: tailscale-workflow
---

If you’ve ever wanted your phone to double as a full-fledged development studio (complete with SSH, live previews, and your entire workflow at your fingertips) then this story is for you. It’s about how a small experiment with Tailscale turned into a complete rewire of how I build, code, and stay connected. From private dev environments to bathtub coding sessions (yes, really), here’s how it all came together.

Every section in this story layers on the next, building toward the “I can’t believe my phone is a full dev studio” moment at the end—so if you can, read it through. The payoff is worth it.

[[toc]]

### It Started as an Experiment

I only dipped my toes into Tailscale recently. I figured it might be handy for the odd remote SSH session, but I didn’t expect it to become the backbone of how I build and ship my projects. Within days it rewired my routine, especially while working on my Eleventy starter (Subspace Builder) and the blog that documents it.

### Private-by-Default Development

Subspace Builder’s dev server, shared components, and all the messy work-in-progress branches now live safely on my tailnet. Instead of cracking open public ports just to test a feature, I point everything at Tailscale’s 100.x.x.x network. SSH, Eleventy’s hot-reloading preview, and even the Umami analytics dashboard stay private while remaining instantly reachable.

That single design choice changed my stress levels. Knowing that `ssh nicholas@macbook-pro` or `https://macbook-pro.tailXX.ts.net:8080` only resolves inside the mesh network feels like 1000% peace of mind. No more juggling firewall rules or staging passwords.

### Phone-in-the-Pocket Access

The other surprise was how smooth the mobile experience feels. Blink + mosh on iOS gives me a full tmux-powered workstation anywhere:

- `mosh pro` drops me straight into my MacBook with the default user set to `nicholas`.
- `mosh debian` connects to my VPS using a dedicated `<remote-user>` account.

A tiny Blink config maps those hostnames to the right usernames, so I rarely type more than the hostname. From there, Codex is on one pane, Eleventy logs in another, git status in a third—all on a phone screen.

### Family-Friendly Networking

Setting up secure networking for non-technical people is usually a recipe for weekend tech support. Tailscale was the opposite. My family members in China installed the app, scanned a QR code, and suddenly had a clean path out of the Great Firewall by hopping through machines I already keep online. No CLI, no routers. Just log in and tap the device you want to reach.

### Exit Nodes and Everyday Privacy

Speaking of exit nodes: flipping one on is literally one command on the host and a toggle in the mobile app. I keep a small server online as my “anywhere” proxy, and because it lives outside the UK I can bypass the country’s age-verification gate without handing documents to third-party vendors. After watching services leak massive troves of identity data (Discord’s vendor breach being a recent example), I’ll take a trusted exit that I control over uploading IDs to yet another provider any day.

### Why I’m All-In

I thought Tailscale would be “yet another VPN.” Instead, it gave me:

- Frictionless private access to every dev environment I care about.
- A joyful mobile coding rig that feels like my Mac shrunk into my pocket.
- A way to help my family browse the open internet without extra hassle.
- A fast safety net when I travel and need my own global proxy.

For an app I installed almost on a whim, it has quietly become the backbone of my workflow.

### The Final Frontier: `<redacted>` Coding Sessions Are Real

Case in point: I’m writing this very post from my bathtub — yes, really (waterproof devices only 😜). Tailscale, Blink, mosh, and tmux link me straight to my Mac like it’s sitting right in front of me. GPT fills in paragraphs, Eleventy’s preview server hums quietly, and Tailscale Serve pipes the private preview through my tailnet, like some kind of digital magic trick.

It’s funny, sure, but also kind of incredible. This tiny slab of glass in my hand has become a full development studio, a portal into every part of my workflow, no cables or ports in sight. We’ve reached the point where comfort and capability coexist — where even from a bathtub, I can build, write, and ship.

What a time to be alive!

<!--
## LinkedIn Adaptation
💫 Tailnet is a super power.

Full blog here: ["Can you believe this?" — The Tailscale Setup That Gave Me Absolute Freedom](https://blog.nicholas.clooney.io/posts/tailscale-workflow/)

I don’t think people realize how much Tailscale rewired my day-to-day. The feeling of “I can build from anywhere” landed hard, and I’m still riding that high.

Subspace Builder, my Eleventy starter, the dev server, and even Umami analytics now live quietly on the 100.x tailnet. No exposed ports, 100% security & control, just real peace of mind.

On my iPhone/iPad, with Blink (terminal app) + mosh, I can easily get instant access to my Mac's full devkit setup with `mosh pro`.
Exit nodes are engineered for humans: one command on the server. Even my non-technical family had it working in minutes—install, sign in, done. One toggle in the mobile app, and my family can route around the Great Firewall. I can also use that to get around the UK’s age verification gate without entrusting IDs to third parties, especially after incidents like the recent Discord vendor breach.

Case in point: I’m drafting the whole blog from one of the most relaxed “workstations” imaginable (waterproof devices only) — connected to my Mac through Tailscale, Blink, mosh, and tmux. GPT is filling in paragraphs, Eleventy’s preview server is humming along, and Tailscale Serve is piping the private URL straight to my tailnet.

I expected “another VPN.” What I got was the backbone of my workflow.
-->
