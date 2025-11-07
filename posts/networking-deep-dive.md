---
title: "Debugging Tailscale on UK Mobile Networks: A Journey into NAT, DERP, and IPv6"
date: 2025-09-29
eleventyNavigation:
  key: networking-deep-dive
tags:
  - tailscale
  - networking
  - private-network
  - infra
---

## Introduction

What started as a simple question — *"Why can’t I reach my MacBook over Tailscale from my iPhone on mobile data?"* — turned into a deep dive into NAT types, relay servers, and the hidden power of IPv6. This post documents the technical journey, the dead ends, and the final conclusion.

---

[[toc]]

## The Problem I _Had_

* On **UK mobile data**, the iPhone could SSH into a VPS (US-based) over Tailscale just fine.
* But when I was trying to connect to my MacBook (at home on Hyperoptic broadband) failed.
* Running `tailscale ping iphone` on the MacBook timed out, and `tailscale ping mac` from iPhone showed `relay LHR` but still failed.
* On the **same Wi-Fi network**, iPhone ↔ Mac worked perfectly.

So the mystery: why do VPS connections work, but Mac connections fail?

> *Read further on to find out there was one simple fix!*

---

## First Clues

1. **Mac Tailscale netcheck (initially)**:

   ```
   IPv6: no
   IPv4: yes, behind NAT
   PortMapping: UPnP, NAT-PMP, PCP
   MappingVariesByDestIP: false
   ```

   → At first, Mac did not have IPv6. It was behind NAT but the router supported port mapping, so NAT was not symmetric.

2. **Ping results**:

   * `tailscale ping debian (VPS)` → worked, direct IPv4 path.
   * `tailscale ping iphone` → failed, even via relay (DERP LHR).

3. **Sleep was ruled out** (Mac was configured never to sleep).

---

## The Double NAT Discovery

Initially the Mac was behind **double NAT** (home router + ISP box). After plugging the router directly:

* WAN IP showed `100.71.x.x` → inside `100.64.0.0/10`, confirming **Carrier-Grade NAT (CGNAT)**.
* Result: Mac was still not directly reachable over IPv4.

---

## Trying IPv6

Hyperoptic provided IPv6 (example, dummy addresses for illustration):

* Router got a `/56` prefix: `2a01:abcd:1234::1/56`
* Mac received a global IPv6: `2a01:abcd:1234::97d2`
* Confirmed with browser tests: the Mac was globally reachable over IPv6.

This was a breakthrough: no more NAT for the Mac.

---

## The iPhone Test

The missing piece was the iPhone’s mobile connection:

* Visiting [https://test-ipv6.com/](https://test-ipv6.com/) (Avoid Safari, in case you have Private Relay on) on iPhone (mobile data only) showed: **IPv6: no**.
* Confirmed: iPhone had only IPv4 (CGNAT).
* Safari Private Relay briefly tricked us into thinking IPv6 was present, but it was just Apple’s proxy.

Conclusion: **iPhone mobile network is IPv4-only, CGNAT**.

---

## Why VPS Worked, but Mac Didn’t

* **iPhone → VPS**: VPS has public IPv4 → direct connection succeeds.
* **Mac → VPS**: Mac can connect outbound → succeeds.
* **iPhone ↔ Mac**: both behind NAT/CGNAT → no direct path. Must use DERP.
* **But DERP relay (UDP) was unreliable** on mobile carrier → packets dropped.

---

## Final Findings

1. **Mac is fine**: with IPv6, it’s globally reachable.
2. **VPS is fine**: public IPv4 makes it easy.
3. **iPhone mobile carrier was the blocker at first**:

   * Initially, no IPv6 support → stuck in IPv4 CGNAT.
   * DERP UDP traffic was flaky or blocked → relay fallback failed.
4. **The One Simple Fix**: But later, after activating the UK SIM properly, the iPhone suddenly received a public IPv4 (85.xxx.xxx.xxx). This allowed **direct iPhone ↔ Mac connectivity** without DERP.

---

## Potential Workarounds

(if you don't have a public IPv4 address for your mobile)

* On Mac: could force DERP to guarantee relay, but the real issue is on iPhone’s side.
* Alternative: use VPS as an **exit node / relay** for iPhone → Mac traffic.
* Long-term fix: switch to a mobile carrier that offers either **public IP address**, or **IPv6 on mobile data**.

---

## Conclusion

This long journey showed how much the success of peer-to-peer VPNs like Tailscale depends on what’s happening under the hood:

* CGNAT breaks IPv4 peer connectivity.
* DERP relays save the day — unless your carrier filters UDP.
* IPv6 is the real solution, but only if *both* ends support it.

In our case: the Mac was ready, but the iPhone’s mobile carrier wasn’t. The lesson: sometimes the problem isn’t your device or Tailscale — it’s the invisible network policies between you and the internet.
