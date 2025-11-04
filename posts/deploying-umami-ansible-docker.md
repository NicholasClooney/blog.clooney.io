---
title: "Private Analytics With Umami, Docker Compose, and Ansible"
date: 2025-11-03
eleventyNavigation:
  key: deploying-umami-ansible-docker
---

I wanted first-party analytics on my blog without handing traffic data to a SaaS vendor. Umami checked every box: open source, self-hostable, and friendly to privacy. I already keep a small VPS online 24/7, so dedicating a slice of that machine to Umami felt like a perfect fit.

[[toc]]

---

## Why Umami (and Why Now)

Analytics turned into a blind spot once I shut off the usual trackers. I needed something:

- **Self-hosted** so the data never leaves my infrastructure.
- **Lightweight** enough to run on the same box as the rest of my services.
- **Friendly to my workflow** — ideally managed by Ansible like everything else.

Umami ships as a simple Node app that stores data in Postgres. The official docs make it easy to run it locally or in the cloud, but I wanted a repeatable, production-ready setup that I could test on my Mac and deploy with Ansible in one go.

---

## A Quick Umami Primer

If you haven’t met it yet, [Umami](https://umami.is/) is an open-source analytics platform that mirrors the basics of Google Analytics without the bloat. It’s a Node application with a Postgres backend, emits a tiny `<script>` snippet for your sites, and exposes a slick dashboard to explore the data. No third-party cookies, no hidden trackers — just a straightforward way to see who’s visiting.

---

## Deployment Paths I Considered

There are three obvious ways to stand Umami up:

1. Install Node, pnpm, and PM2 directly on the server.
2. Run the app in a single Docker container and manage Postgres separately.
3. Use Docker Compose to define both services and their relationship.

Option 3 won instantly. Compose gives me:

- **Local parity.** I can spin the stack up on macOS using Colima, just like in [my Docker-on-macOS post](/posts/docker-on-macOS-with-colima/).
- **A reproducible bundle.** The compose file describes the exact images, health checks, and volumes needed — perfect for infra-as-code.
- **No host pollution.** The VPS stays a clean Docker box with zero lingering Node/npm/PM2 packages.
- **Expressed dependencies.** Compose orchestrates Postgres + Umami and waits for the DB’s health check before starting the app.
- **Strict networking.** Services talk over a private bridge network. Only the ports I publish make it to the host.
- **Ansible-friendly automation.** Ansible can drop the compose file, render an `.env`, and run `docker compose up -d` in one role.

---

## The Ansible Role at the Core

I wrapped everything in [`ansible-role-umami`](https://github.com/NicholasClooney/ansible-role-umami/tree/main) so I can reuse it across machines. At commit `f31f9b9a1c71039311a71ece3c8c8162de84316c`, the compose template looks like this:

{% github "https://github.com/NicholasClooney/ansible-role-umami/blob/f31f9b9a1c71039311a71ece3c8c8162de84316c/templates/docker-compose.yml.j2#L11-L56" %}

A couple of highlights:

- Postgres persists data in a named volume and exposes a health check.
- Umami waits on that health check before launching.
- The `ports` directive binds to {% raw %}`{{ umami_bind_address }}`{% endraw %} so I can keep it locked to `127.0.0.1` instead of public interfaces.

Defaults live alongside the template, so each install starts loopback-only on port `3000` until I override it:

{% github "https://github.com/NicholasClooney/ansible-role-umami/blob/f31f9b9a1c71039311a71ece3c8c8162de84316c/defaults/main.yml#L1-L27" %}

The main task file ties it all together. Ansible generates strong secrets on the controller (so they persist between runs), templates both `.env` and `docker-compose.yml`, then presses `docker compose up` via the community module:

{% github "https://github.com/NicholasClooney/ansible-role-umami/blob/f31f9b9a1c71039311a71ece3c8c8162de84316c/tasks/main.yml#L1-L72" %}

The handler simply restarts the stack when either template changes, which keeps upgrades predictable.

---

## A Quick Note on Docker vs. UFW

If you publish a port without thinking, Docker quietly bypasses UFW because it owns its own iptables chain. That means even a server with “deny incoming” can leak an app to the public internet if you bind it to `0.0.0.0`.

> When you run a container and publish a port (e.g. `-p 3000:3000`), Docker modifies iptables directly — not through ufw.  
> Those rules are evaluated before ufw’s user-space rules.  
> So a simple `docker run -p 3000:3000 umami` exposes port 3000 on all interfaces (`0.0.0.0`) even if ufw is active.

Binding to `127.0.0.1` inside the compose file keeps the dashboard completely private until I put a reverse proxy (or Tailscale) in front of it.

---

## Dropping the Role Into Project Lighthouse

My homelab playbook (`ansible-project-lighthouse`) consumes the role with just a few lines:

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/main.yml#L27-L36" %}

Group vars clamp the dashboard to the loopback network, ready for a reverse proxy to front it:

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/group_vars/debian_lighthouse/main.yml.template#L12-L35" %}

Because I only trust my tailnet to see sensitive dashboards, I run a tiny systemd unit that publishes Umami through [Tailscale Serve](/posts/how-tailscale-revolutionized-my-mobile-workflow/):

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/roles/tailscale_serve/tasks/main.yml#L1-L19" %}

That translates to a private `https://umami.tailXX.ts.net` endpoint that only logged-in tailnet devices can reach. No public ingress, no guesswork.

---

## Publishing the Tracking Script With Nginx

The public web still needs `/script.js` and `/api/send`, so I carved out an Nginx site that only exposes those endpoints while keeping the full dashboard locked to my allowlist:

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/roles/umami_nginx/templates/analytics.conf.j2#L1-L68" %}

- `/script.js` and `/api/send` proxy straight through to Umami, complete with the required CORS headers.
- Any other path hits the allowlist first — in production I set it to tailnet ranges so only I can see the UI.

With that in place, the public site embeds Umami’s script tag while the administrative interface stays non-routable unless you’re me.

---

## The Stack in Motion

Putting it all together looks like this:

1. **Ansible** renders `.env` + `docker-compose.yml`, generates secrets, and runs `docker compose up -d`.
2. **Docker Compose** brings up Postgres + Umami, health checks everything, and binds the UI to loopback.
3. **Tailscale Serve** publishes the dashboard to my tailnet so I can check analytics from anywhere (even on mobile).
4. **Nginx** proxies just the beacon endpoints to the public internet while keeping the rest locked down.

Because the role also runs locally, I can clone the repo, fire up Colima, and test the exact stack on my Mac before pushing changes upstream. When updates drop, `ansible-playbook main.yml --tags umami` pulls the new image and restarts the stack cleanly.

---

## Final Thoughts

This setup sounds complex on paper, but it condenses into a repeatable Ansible run:

- Compose keeps the host tidy and the deployment predictable.
- Tailscale and Nginx add just enough routing to stay private-by-default.
- Secrets never leave my control, and rollbacks are one `docker compose down` away.

If you’re already automating servers with Ansible, steal the role, tune the defaults, and try the workflow on a Colima sandbox first. When you’re ready to go live, aim the playbook at your server and enjoy Umami’s dashboard — privately. Then take a detour through the related posts on [Colima](/posts/docker-on-macOS-with-colima/), [Tailscale](/posts/how-tailscale-revolutionized-my-mobile-workflow/), and [debugging Umami](/posts/debugging-umami/) to see how the rest of the puzzle pieces fit together.
