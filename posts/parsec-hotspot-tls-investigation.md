---
title: "When DNS Was Innocent: Chasing a Parsec Failure Through TLS, VPNs, and a Phone Hotspot"
date: 2026-03-22
eleventyNavigation:
  key: parsec-hotspot-tls-investigation
tags:
  - networking
  - tls
  - dns
  - macos
  - vpn
  - debugging
excerpt: |
  A Parsec outage looked like DNS trouble at first, but the real issue was hostname-specific TLS failure on one network path. This post follows the investigation from misleading symptoms to the hotspot-based fix that exposed what was really happening.
---

It was a lovely Sunday morning in London. I brought my MacBook Air outside and sat in the sun, planning to do a bit of programming by remoting into my MacBook Pro at home with Parsec. To my surprise, it was not working.

[[toc]]

# When DNS Was Innocent: Chasing a Parsec Failure Through TLS, VPNs, and a Phone Hotspot


A familiar suspicion came to mind straight away. I thought I was running into the same kind of Tailscale DNS problem I had previously hit and documented in `macos-browsers-cant-load-websites-dns-resolver-state`. But as I dug further, it turned out to be something else entirely, and honestly, something much more surprising.

A strange networking bug showed up with a very convincing red herring.

Parsec would not launch properly, its website would not load, and `brew reinstall --cask parsec` failed. At first glance it looked like classic DNS trouble. The hostname sometimes seemed unreachable, and the failure felt selective enough to suggest resolver weirdness. But the deeper investigation told a different story: DNS was fine. The real failure was happening later, during TLS, and only on one network path.

This post walks through the investigation, what the signals meant, and why a VPN temporarily "fixed" the issue.

## The Symptom

Three things were broken on the same machine:

- The Parsec app would not start correctly
- `https://parsec.app` would not load
- `brew reinstall --cask parsec` failed to download the package

At the same time, basic connectivity still seemed healthy:

- DNS lookups appeared to work
- `ping` worked
- General internet access was fine

That combination is exactly what makes this kind of issue annoying. It feels like DNS, but not quite. It feels like general connectivity, but not quite.

## First Pass: Eliminate the Obvious

The first checks were the usual local suspects:

- No shell proxy variables were set
- macOS proxy settings were empty
- `/etc/hosts` did not contain anything suspicious
- Homebrew itself was healthy
- There was no obvious local override for `parsec.app`

Then the key test:

```bash
curl -I -v --connect-timeout 10 https://parsec.app
```

The result was the first major clue. It did not fail at name resolution. It resolved `parsec.app`, opened a TCP connection to port `443`, sent a TLS ClientHello, and then the connection was reset.

That is a very different class of failure from bad DNS.

In other words:

- DNS resolution succeeded
- Routing to the server succeeded
- TCP connect succeeded
- The break happened during TLS handshake

That immediately moved the investigation away from "stale resolver cache" and toward "something on the path does not like this hostname."

## What Homebrew Was Really Telling Us

The failed Homebrew reinstall was also useful.

`brew reinstall --cask parsec` eventually failed trying to fetch Parsec from:

```text
https://builds.parsec.app/package/parsec-macos.pkg
```

Testing that directly showed the same pattern: DNS resolution worked, TCP connected, TLS was reset.

Now this was no longer "the app is broken" or "the website is broken." Multiple Parsec HTTPS endpoints were failing in the same way.

That narrowed the scope to a network-path problem affecting Parsec domains specifically.

## The Comparison Test That Changed Everything

At this point the strongest hypothesis was hostname-based blocking at the TLS layer, often driven by SNI.

To test that, I connected to the same Cloudflare IP with two different hostnames.

First, Parsec:

```bash
openssl s_client -connect 104.18.1.181:443 -servername parsec.app -brief
```

That failed immediately with a reset.

Then, same IP, different SNI:

```bash
openssl s_client -connect 104.18.1.181:443 -servername www.cloudflare.com -brief
```

That completed successfully.

This was the decisive result.

The same edge IP would happily complete TLS for `www.cloudflare.com`, but would reset the connection when the requested hostname was `parsec.app`. That means the problem was not basic reachability to the server, not generic Cloudflare breakage, and not a resolver issue. The differentiator was the hostname presented during TLS.

That is a strong signature of hostname-specific filtering or rejection somewhere on the network path.

## Apple's Networking Stack Confirmed It

To make sure this was not just a curl/OpenSSL quirk, the same site was tested through Apple's own networking stack:

```bash
nscurl --verbose https://parsec.app
```

That produced an SSL failure as well. So this was not a Homebrew problem and not a curl library problem. The native macOS stack saw the same secure connection failure.

## Why VPN Became the Breakthrough

Then came the surprising behavior.

When ProtonVPN was enabled, Parsec worked. The website loaded. The app worked. Downloads worked.

When ProtonVPN was disabled, the problem returned.

That single toggle changed the interpretation of the whole incident.

If a VPN makes the site work, that usually means:

- The destination service is healthy
- The local machine is capable of connecting
- The normal network path is the variable

A VPN changes both the route and the observed public IP. It can also conceal the original destination from intermediate network devices, depending on where filtering occurs. So if Parsec works inside the VPN tunnel but fails outside it, the most likely explanation is that the ordinary network path is interfering with that traffic.

At that point DNS became even less likely as the root cause. DNS cache flushing does not explain why encapsulating traffic in a VPN makes the problem disappear.

## The Important Environmental Detail

The machine was not on normal home broadband. It was connected through a phone hotspot.

That mattered a lot.

The active interface showed a private address in the `172.20.10.x` range, which is commonly what macOS gets from iPhone Personal Hotspot. Once that was clear, the likely culprit shifted to the mobile carrier path itself.

The working theory became:

- On the hotspot path, traffic to `parsec.app` was being reset during TLS based on hostname/SNI
- Inside ProtonVPN, that hostname was hidden from the hotspot/carrier path, so the connection worked normally

That fits every observed behavior.

## Why It Was Not DNS

This is worth stating plainly, because the symptoms were misleading.

It was not a DNS problem because:

- `parsec.app` resolved correctly
- There was no bad `/etc/hosts` entry
- TCP reached the correct server on `443`
- The failure occurred after connect, during TLS
- The same host worked over VPN without any local DNS surgery
- The same edge IP succeeded with another hostname

A broken DNS cache would usually send you to the wrong place, fail to resolve, or intermittently return the wrong record. It would not consistently allow TCP connect and then trigger an SNI-specific TLS reset.

## The Most Likely Root Cause

The evidence points to hostname-specific filtering on the phone hotspot or carrier network path.

That filtering may have been:

- Intentional policy enforcement
- A false positive in carrier-side traffic inspection
- A temporary issue at some middlebox
- A path-specific interaction with Cloudflare and the Parsec hostname

I can't prove which one without visibility into the carrier network, but the local evidence is strong enough to be confident about the layer where the failure occurred.

## The Two Best Diagnostic Commands

If you ever want to separate "DNS problem" from "TLS/SNI problem" quickly, these two checks are excellent:

```bash
curl -I -v --connect-timeout 10 https://parsec.app
```

If you see resolution succeed, TCP connect succeed, and then a reset during TLS, DNS is not your primary issue.

And then:

```bash
openssl s_client -connect 104.18.1.181:443 -servername parsec.app -brief
openssl s_client -connect 104.18.1.181:443 -servername www.cloudflare.com -brief
```

If the first fails and the second succeeds on the same IP, the network path is treating hostnames differently during TLS.

That is a very strong signal.

## Practical Outcome

The practical fixes were straightforward:

- Use ProtonVPN as a workaround
- Switch to a different network
- Treat the phone hotspot/carrier path as the likely source of interference

What looked like a DNS issue turned out to be a cleaner and more interesting networking lesson: resolution, routing, TCP, and TLS are separate steps, and the fact that one works tells you very little about the others.

In this case, DNS was innocent. The real problem lived in the gap between "connected to port 443" and "secure connection established."
