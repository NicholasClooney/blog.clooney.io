---
title: "When macOS browsers can’t load websites but `ping`, `ssh`, and `dig` still work"
date: 2026-03-04
eleventyNavigation:
  key: macos-browsers-cant-load-websites-dns-resolver-state
tags:
  - macos
  - dns
  - tailscale
  - pi-hole
  - networking
  - troubleshooting
  - devops
excerpt: |
  Browsers failing while `ping`, `ssh`, and `dig` still work can point to a split macOS resolver failure. In this post, I break down how a Tailscale + Pi-hole setup triggered resolver state corruption and how resetting DNS settings immediately fixed it.
---

I recently ran into a strange networking issue on macOS while running a custom DNS setup with **Tailscale and Pi-hole** - aka. my [Private Ingress Engine](/posts/a-everywhere-accessible-but-publicly-invisible-ingress-engine/).

The machine clearly had network connectivity:

* `ssh` worked
* `parsec` worked
* `ping 1.1.1.1` worked
* `dig` resolved domains

But both **Safari and Firefox could not load any websites**.

Not public domains:

```text
youtube.com
```

Not my private domains either:

```text
private.clooney.io
```

Even stranger: clearing DNS cache did nothing to fix this but resetting the DNS server in macOS network settings instantly fixed the issue.

After digging deeper, the problem turned out to be a **split DNS resolver state corruption on macOS** combined with a fairly complex DNS path involving Tailscale and a containerized Pi-hole.

[[toc]]

---

## My Setup

> See detailed explainer in my [Private Ingress Engine](/posts/a-everywhere-accessible-but-publicly-invisible-ingress-engine/) post

My machines run inside a Tailscale tailnet and use custom DNS.

The MacBook Air points to Tailscale MagicDNS:

```text
DNS server: 100.100.100.100
```

Architecture:

```text
MacBook Air
    ↓
100.100.100.100 (Tailscale MagicDNS)
    ↓
Pi-hole DNS server
    ↓
Upstream resolvers
```

The Pi-hole instance itself runs in a container on another machine:

```text
MacBook Pro
 └─ Docker container
     └─ Pi-hole
         └─ connected to a Tailscale container (service mode)
```

So DNS resolution actually travels through multiple layers:

```text
MacBook Air
 → Tailscale MagicDNS proxy
 → tailnet tunnel
 → MacBook Pro
 → Docker container network
 → Pi-hole
 → upstream DNS
```

In other words, a DNS request involves **two Tailscale hops and a container network boundary**.

---

## The Symptoms

When the issue occurred, the system behaved like this:

| Tool             | Result  |
| ---------------- | ------- |
| `ping 1.1.1.1`   | ✅ works |
| `ssh server`     | ✅ works |
| `dig google.com` | ✅ works |
| `dns-sd -G v4 google.com` | ❌ fails |
| Safari           | ❌ fails |
| Firefox          | ❌ fails |
| private domains  | ❌ fails |

So clearly:

* the network stack worked
* DNS servers were reachable
* yet browsers couldn't resolve domains

---

## The Key Detail: macOS Has Two DNS Paths

The confusing part is that `dig` worked:

```bash
dig google.com
```

This happens because macOS effectively has **two different DNS resolution paths**.

### 1. System resolver

Used by many CLI tools.

Handled by:

```text
mDNSResponder
```

Tools that often use this path:

* `ping`
* `dig`
* `ssh`
* various system utilities

### 2. Network.framework resolver

Used by higher-level networking APIs such as:

```text
URLSession
Network.framework
```

Browsers rely heavily on this path.

This resolver performs additional validation such as:

* checking DNS server responsiveness
* retry logic
* DNS-over-TCP fallback
* stricter error handling

Browsers therefore tend to be **less tolerant of partial DNS failures**.

---

## What Was Actually Happening

The machine ended up in a **partially broken DNS state**.

```text
System resolver (mDNSResponder)   → still working
Network.framework resolver        → stuck / unhealthy
```

Which resulted in behavior like:

| Tool     | Result |
| -------- | ------ |
| `dig`    | works  |
| `ping`   | works  |
| `ssh`    | works  |
| `dns-sd`    | fails  |
| browsers | fail   |

This explains why the machine appeared healthy while browsers were broken.

---

## Why This Happens with Tailscale + Pi-hole

The DNS path in this setup is fairly long:

```text
Air
 ↓
Tailscale MagicDNS proxy
 ↓
tunnel
 ↓
MacBook Pro
 ↓
Docker network
 ↓
Pi-hole
```

If any of these components briefly hiccup, such as:

* the MacBook Pro sleeping
* a container restart
* Docker network changes
* Pi-hole overload
* Tailscale reconnect

the MagicDNS proxy on the Air can end up in a **degraded state**.

In that state:

* some queries still succeed
* but certain responses may be malformed, truncated, or delayed

Possible failure modes include:

* truncated DNS responses
* `SERVFAIL` responses
* DNS-over-TCP fallback failing
* temporary upstream unavailability

CLI tools often tolerate these issues.

Browsers typically do not.

---

## Why Resetting DNS Fixes It

Toggling the DNS settings forces macOS to **rebuild its resolver configuration**.

This resets internal state for:

```text
Network.framework
mDNSResponder
per-interface DNS resolvers
```

Importantly, this is **not the same as clearing DNS cache**.

---

## Why Clearing DNS Cache Didn't Help

Typical advice suggests running:

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

This clears cached DNS records.

But in this case the problem was the **connection state to the resolver**, not cached records.

---

## Quick Script to Reset macOS DNS State

Manually toggling DNS settings in System Settings gets old quickly.

Since the fix involves forcing macOS to rebuild its resolver configuration, this can be automated with a small script.

The idea:

1. Clear DNS servers and search domains
2. Wait briefly so macOS emits a `configd` event
3. Restore the DNS configuration

Example script:

```bash
#!/bin/bash

# Primary network interface (usually en0 on MacBook Air Wi-Fi)
IFACE="en0"

# Grab current Tailscale DNS settings
CURRENT_DNS=$(networksetup -getdnsservers "$IFACE")
CURRENT_SEARCH=$(networksetup -getsearchdomains "$IFACE")

# Clear DNS + search domains (forces configd update)
networksetup -setdnsservers "$IFACE" empty
networksetup -setsearchdomains "$IFACE" empty

sleep 1

# Restore DNS configuration
networksetup -setdnsservers "$IFACE" 100.100.100.100
networksetup -setsearchdomains "$IFACE" your.tailnet.name.ts.net
```

Running this script effectively performs the same action as toggling DNS settings in the macOS Network UI.

Because it triggers two `configd` events:

```text
clear DNS → configd rebuild
restore DNS → clean resolver initialization
```

This resets resolver state used by both:

```text
mDNSResponder
Network.framework
```

Which is why browsers immediately start resolving domains again.

---

## Optional: Clear DNS Cache

If you also want to clear cached records:

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
sudo killall mDNSResponderHelper
```

In practice, the resolver reset alone is usually sufficient.

---

## Useful Debugging Commands

If the issue occurs again, these commands help diagnose it before resetting.

Check connectivity:

```bash
ping 1.1.1.1
```

Check DNS directly:

```bash
dig @100.100.100.100 google.com
```

Check the macOS resolver:

```bash
dscacheutil -q host -a name google.com
```

Inspect resolver configuration:

```bash
scutil --dns
```

Test the browser-style resolver path:

```bash
dns-sd -G v4 google.com
```

---

## Likely Root Cause

The most likely sequence looks something like this:

```text
MacBook Air sleeps
↓
Tailscale reconnects
↓
Pi-hole container briefly unavailable
↓
MagicDNS proxy enters degraded state
↓
Network.framework resolver rejects responses
↓
Browsers fail DNS lookups
```

Resetting DNS forces macOS to rebuild the resolver configuration.

---

## Takeaway

If you encounter a situation where:

* browsers cannot load websites
* `ping` works
* `ssh` works
* `dig` works

the issue may be **macOS resolver state corruption**, not network connectivity.

This edge case is especially likely when running custom DNS setups involving:

* Tailscale
* Pi-hole
* containerized DNS servers
* private domains

Resetting DNS configuration or cycling the network interface typically resolves the issue.
