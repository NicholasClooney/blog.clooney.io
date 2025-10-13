---
title: "How Tailscale Took Over My Remote Workflow"
date: 2025-10-15
draft: true
eleventyNavigation:
  key: tailscale-workflow-draft
excerpt: |
  A late adopter’s love letter to Tailscale: why it now powers Subspace Builder development, private analytics, and even my family’s everyday browsing.
---

[[toc]]

## Full Blog Draft

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

For an app I installed almost on a whim, it has quietly become the nervous system of my workflow.

### Bathtub Coding Sessions Are Real

Case in point: I’m drafting this post from a bathtub, connected to my Mac through Tailscale, Blink, mosh, and tmux. GPT is filling in paragraphs, Eleventy’s preview server is humming along, and Tailscale Serve is piping the private URL straight to my tailnet. Git is right there whenever I want to check diffs or commit. It still blows my mind that a phone can be the entire control room. What a time to be alive.

## LinkedIn Adaptation

Late to the Tailscale party, but it’s already the center of my remote setup:

- My Eleventy starter (Subspace Builder), dev server, and Umami analytics all stay private on the 100.x tailnet—no exposed ports, just peace of mind.
- Blink + mosh on iPhone means `mosh pro` (MacBook) and `mosh debian` (VPS) are a tap away thanks to a tiny bit of host/user config.
- Exit nodes are trivial: one command on the host, one switch in the mobile app. I use them to hop out of regional firewalls, including China’s GFW, and to sidestep the UK’s age-verification gate without handing IDs to third parties (remember the recent Discord vendor breach?).
- Writing this draft from a bathtub on my phone—Blink + mosh + tmux give me my Mac’s dev setup, GPT handles prose, Eleventy previews via Tailscale Serve, and git is a command away. Wild times.
- Even my non-technical family had it running in minutes. Install, sign in, done.

I expected “another VPN.” I got the backbone of my workflow instead.
