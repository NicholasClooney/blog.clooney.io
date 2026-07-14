---
title: "blog: GL.iNet Slate 7, Tailscale, and split-routing around the Great Firewall"
date: "2026-07-14"
time: "14:54"
tags:
  - published
  - networking
  - tailscale
  - china
  - gfw
  - glinet
  - openwrt
  - pbr
---

I published [GL.iNet Slate 7, Tailscale, and Split-Routing Around the Great Firewall](/posts/gl-inet-slate-7-tailscale-and-china-split-routing/), a full technical writeup of the router-level setup I run in China: a Slate 7 carrying Tailscale as the default route to a Debian VPS exit node, with PBR sending Chinese CIDRs direct out the physical uplink and a dnsmasq split so CN domains resolve via AliDNS and everything else rides stubby DoT to Cloudflare. The post spends most of its time on the two war stories that took the longest to unstick: getting PBR's fwmark rules to win over Tailscale's exit-node rule, and hunting down GL.iNet's `vpn_table` stamping every LAN packet with `0x8000` and quietly breaking Google and YouTube. All the shell, nftables, and dnsmasq snippets embed live from a [public gist](https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c), pinned to a revision so the post never drifts underneath its own code.
