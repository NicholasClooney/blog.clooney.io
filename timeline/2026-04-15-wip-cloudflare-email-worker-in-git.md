---
title: "wip: moving the Cloudflare Email Worker into Git"
date: "2026-04-15"
time: "18:14"
parent: "/timeline/2026-04-12-published-cloudflare-build-notifications/"
tags:
  - timeline
  - wip
  - cloudflare
  - workers
  - email
  - tooling
---

This grows out of [Cloudflare Build Notifications via Email Routing and Email Worker](/posts/cloudflare-build-notifications-email-worker/), but I’m now moving the Email Worker out of the Cloudflare dashboard editor and into Git in [NicholasClooney/cloudflare-email-to-webhook-worker](https://github.com/NicholasClooney/cloudflare-email-to-webhook-worker). The goal is to keep the worker version controlled, review changes before deploys, test locally, and configure it with Wrangler instead of only editing it in the Cloudflare web UI. Right now it is still mostly Wrangler init plus the example email worker, but that is a solid foundation to build from.
