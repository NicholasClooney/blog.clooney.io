---
title: "How I Accidentally Exposed My Umami Dashboard (and What I Learned)"
date: 2025-10-03
eleventyNavigation:
  key: accidentally-exposed-my-umami-dashboard
tags:
  - umami
  - docker
  - tailscale
  - private-network
  - security
  - infra
  - devops
---

Recently, a few hours after setting up [Umami](https://umami.is/) with Docker and Nginx on my VPS, I stumbled into a misconfiguration that left the admin dashboard exposed to the public web. Thankfully, there was no immediate danger. Since right after creating Umami's docker instance, I have updated the admin username and password immediately, and locked it down before anything bad could happen. Still, it was a stressful reminder that small mistakes in deployment can have big consequences.

Here’s the story of what happened and what I learned along the way.

[[toc]]

---

## The Misconfiguration

My initial Docker Compose setup for Umami included:

```yaml
ports:
  - "0.0.0.0:3000"
```

This published the container on **0.0.0.0:3000**, making it accessible to the entire internet. I had assumed that my firewall (UFW) would block access, but I later learned that Docker bypasses UFW with its own iptables rules. So, despite UFW saying port 3000 was closed, it was wide open.

When I tested from outside, `http://myserverip:3000/dashboard` was publicly reachable. 

**Oops.**

---

## The Fix

To shut it down, I adjusted Docker Compose to **bind only to localhost**:

  ```yaml
  ports:
    - "127.0.0.1:3000:3000"
  ```

This meant Umami was no longer accessible from the internet — only the host itself could reach it.

---

## But Then: Tailnet Access Broke

Since I often access my dashboard over Tailscale (`http://debian.tailXXXX.ts.net:3000/dashboard`), suddenly that stopped working. Why?

* Nginx could still access `127.0.0.1:3000`, because it’s local.
* But my tailnet peers were trying to hit the server’s Tailscale IP (`100.x.x.x:3000`), where nothing was listening.

The fix: **Tailscale Serve**.

```bash
sudo tailscale serve --https=443 http://127.0.0.1:3000
```

This made Umami available at `https://debian.tailXXXX.ts.net/dashboard`, privately over my tailnet, without exposing it to the public internet.

---

## Key Lessons Learned

### 1. Docker ports and exposure

* `"0.0.0.0:3000"` exposes to the world, regardless of UFW.
* Safer options:

  * Bind only to `127.0.0.1:3000`.
  * Or skip `ports:` entirely and connect via Docker network.

### 2. Why Nginx worked but Tailnet didn’t

* Services on `127.0.0.1` are local-only.
* Nginx runs on the host, so it could still reach Umami.
* Tailscale peers connect via `tailscale0` (100.x.x.x), so they couldn’t.

### 3. Tailscale Serve vs Funnel

* `tailscale serve` shares locally running services over your **tailnet only**.
* It does **not** expose to the public internet.
* Public exposure only happens with **Tailscale Funnel**, which is opt-in.

### 4. Final secure setup

* Umami bound to `127.0.0.1:3000`.
* Nginx proxies only `/script.js` and `/api/{send,collect}` to the world.
* Dashboard reachable only through Tailscale Serve.

---

## Conclusion

What started as a small misconfiguration turned into a valuable security lesson. Always verify what’s actually exposed with `ss`, `docker ps`, or `nmap` — don’t just assume firewalls have your back. Today, my Umami setup is both safer and cleaner: public endpoints for analytics only, private dashboard access via Tailscale.

If you’re self-hosting, learn from my mistake: **don’t trust assumptions — trust verification.**
