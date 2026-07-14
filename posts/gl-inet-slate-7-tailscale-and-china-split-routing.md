---
title: "GL.iNet Slate 7, Tailscale, and Split-Routing Around the Great Firewall"
date: 2026-07-14
time: "14:54"
tags:
  - networking
  - tailscale
  - china
  - gfw
  - glinet
  - openwrt
  - pbr
  - dnsmasq
  - nftables
  - infra
excerpt: |
  A full technical walkthrough of the router-level setup I run in China:
  a GL.iNet Slate 7 running Tailscale as the default route to a Debian
  VPS exit node, with policy-based routing sending CN traffic direct
  and a DNS split that keeps Chinese and foreign services both fast.
  Includes the three gotchas that took the longest to unstick: LAN
  forwarding and MASQUERADE on `tailscale0`, PBR-vs-Tailscale
  precedence, and the GL.iNet 0x8000 mark leak.
---

I am visiting family in China for a few weeks, and I want my internet freedom back. That is really the whole motivation for this post. Living behind the Great Firewall is a routing problem in disguise. You want the open internet by default, you want Taobao and WeChat and your bank to stay fast, and you want it to keep working when you plug into hotel ethernet or a repeater to somebody's home wifi. For a long time I solved this per-device with [Quantumult X](https://quantumult-x.com/) on my Apple gear and a [v2ray](https://www.v2ray.com/) vmess proxy on a Debian VPS. That works great for phones and laptops. It does nothing for a Switch, a TV, an Apple TV, or the wife's Windows machine.

The fix was to move the split down to the network itself: a [GL.iNet Slate 7](https://www.gl-inet.com/products/gl-be3600/) that carries Tailscale as its default route to the same Debian VPS (which now doubles as a Tailscale exit node), with [policy-based routing](https://openwrt.org/docs/guide-user/network/routing/pbr) sending Chinese destinations direct out the physical uplink. It was not plug and play. Getting there took a few debugging sessions I want to write down while they are still fresh.

---

[[toc]]

## TL;DR

- **VPS**: Debian box outside China running both a v2ray/vmess proxy (for Quantumult X on iOS and macOS) and a Tailscale exit node. Same box, two ways in.
- **Router**: GL.iNet Slate 7 (OpenWrt-based) running the native Tailscale client, with the VPS set as its exit node.
- **Split routing**: China IPv4 destinations get an fwmark and are routed direct out the current physical uplink (`sta0` in repeater mode, `wan` when wired). Everything else falls through to Tailscale and rides the exit node.
- **Split DNS**: CN domains resolve via AliDNS (`223.5.5.5`) direct; everything else resolves via stubby DoT to Cloudflare, whose traffic itself rides the exit node so ISP DNS poisoning cannot touch it.
- **The three gotchas**, none documented anywhere obvious, any one of which silently breaks LAN clients while leaving the router itself working fine:
    - The `tailscale0` firewall zone needs MASQUERADE turned on (and a `lan -> tailscale0` forwarding entry) before LAN traffic can egress through it at all.
    - Tailscale's exit-node IP rule outranks PBR by default, so every packet gets tunneled even the ones you marked to go direct.
    - GL.iNet's `vpn_table` stamps every LAN packet with fwmark `0x8000`, which collides with any early PBR rule that matches on that mark.

## The Bigger Picture

Before the router entered the picture, the setup was two independent things sharing one VPS:

1. **v2ray + vmess** for per-app proxying. Quantumult X on iOS and macOS points at the VPS, uses a rule set to send only foreign traffic through, keeps CN traffic direct.
2. **Tailscale** for private mesh access to home services (Pi-hole, dev machines, self-hosted stuff). No exit node in play at first, just peer connectivity.

Quantumult X is excellent when the client can install it. It is useless on devices that cannot. So the Slate 7 became the "everything else" solution: whatever LAN it hands out, that device gets the same foreign-open, CN-fast experience without needing any client software.

The Slate 7 has a native Tailscale client, which is what made it a candidate at all. Turning it on and pointing at the exit node was easy. Everything that happened after that was not.

## High-Level Architecture

```
                            +--------------------------------------+
                            |          Debian VPS (foreign)        |
                            |  * v2ray/vmess (Quantumult X clients)|
                            |  * Tailscale exit node "debian"      |
                            +------------------^-------------------+
                                               | WireGuard (Tailscale)
                                               |
                            +------------------+-------------------+
                            |         GL.iNet Slate 7 (OpenWrt)    |
                            |                                      |
   iPhone (QuantumultX) --> |  * dnsmasq split: CN -> AliDNS       |
                            |    other -> stubby -> Cloudflare     |
   LAN clients ---------->  |  * PBR: CN CIDRs -> direct uplink    |
                            |    everything else -> tailscale0     |
                            |  * firewall: lan -> tailscale0 +     |
                            |    MASQUERADE on tailscale0 zone     |
                            +----------^--------------------^------+
                                       | sta0 (repeater)    |
                                       | or wan (ethernet)  |
                                       v                    |
                            +----------+-----------+   Chinese ISP
                            | Local Chinese uplink |   (direct for CN,
                            +----------------------+    tunneled for
                                                        everything else)
```

The important bit: Tailscale owns the default route from the router's perspective, and PBR *subtracts* from that default by short-circuiting CN destinations back to the physical uplink. That framing (Tailscale-as-default, PBR-as-exception) is what the whole [china-list ecosystem](https://github.com/felixonmars/dnsmasq-china-list) is built around, and it is the shape that fails the most gracefully — an unknown domain still gets tunneled and still works, maybe slower.

## The Three Pillars

### 1. Tailscale on the router as the default route

Nothing exotic here. Enable the exit node, allow LAN access, and — this is the important flag — do not let Tailscale rewrite the router's DNS. The dnsmasq split needs to stay authoritative.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=02-tailscale-exit-node.sh" %}

The `sleep 180 && tailscale set --exit-node=` line at the bottom is the safety net I always arm when testing exit-node changes over SSH from inside China. If the exit-node change breaks routing (which, spoiler, it did the first time), the router auto-rolls-back three minutes later and I do not lose the box.

### 2. China split routing via PBR + fwmark

The [PBR package](https://openwrt.org/docs/guide-user/services/vpn/pbr) is doing the actual work here. A custom user script, deployed as `/usr/share/pbr/pbr.user.china`, does four things on every PBR reload:

1. Downloads the China IPv4 CIDR list from `https://ispip.clang.cn/all_cn_ipv46.txt`.
2. Picks the active direct uplink dynamically from `wan`, `secondwan`, `wwan`, `tethering`. Explicitly ignores tunnel devices (`tailscale*`, `wg*`, `tun*`, `ppp*`) so it cannot accidentally pick the tunnel as its "direct" path.
3. Loads the CIDRs into the selected PBR nftables set. In repeater mode CN traffic gets fwmark `0x30000` and lands on `pbr_wwan`; in wired-WAN mode it gets `0x10000` and lands on `pbr_wan`.
4. Adds a matching `pbr_output` rule so router-origin traffic (pings from the router itself, DNS from stubby, etc.) is also marked correctly. Without this, the split only works for forwarded LAN traffic.

### 3. Split DNS via dnsmasq

The DNS split is the other half of what makes CN performance good. Chinese CDNs and geo-fenced services return nearby POP IPs *only* when you resolve them against a Chinese-facing DNS. Ask `1.1.1.1` for `taobao.com` and you get whatever POP happens to be closest to Cloudflare, not to you. Ask `223.5.5.5` and you get the right answer.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=06-dnsmasq-china-split.conf" %}

The suffix list comes from [felixonmars/dnsmasq-china-list](https://github.com/felixonmars/dnsmasq-china-list), which is externally maintained and ships ~111k `server=` lines. AliDNS `223.5.5.5` itself sits inside the China CIDR set, so the PBR mark `0x30000` is applied to it at output and it goes direct — no extra rule needed. Everything not matched by the china-list falls through to stubby (`127.0.0.1#5453`), which talks DoT to Cloudflare, and whose upstream traffic rides the Tailscale exit node.

One small ops note: `dnsmasq reload` is a `SIGHUP` and does not reparse `conf-dir`. To pick up changes to `accelerated-domains.china.conf` you need `/etc/init.d/dnsmasq restart`, which takes 3-5 seconds to reparse all 111k lines. During that window, DNS is down. Do it when you can.

## Gotcha 1: LAN to tailscale0 Needs Explicit Forwarding *and* MASQUERADE

The first thing that quietly breaks LAN clients is the firewall side of the exit node. Enabling Tailscale on the router and setting an exit node is enough to make the *router* egress via the tunnel. It is not enough to make LAN clients egress via the tunnel. Two separate pieces are missing by default:

1. A firewall forwarding entry allowing `lan -> tailscale0`. Without this, the packet gets rejected before it ever hits the routing decision.
2. MASQUERADE on the `tailscale0` zone. Without this, the packet does route out `tailscale0`, but with the LAN client's `192.168.8.x` source IP untranslated. The exit node returns the packet to the tailnet, the tailnet has no idea what `192.168.8.x` is, and the flow dies.

Missing MASQUERADE is the one that fooled me the longest, because packets *left* the router — `tcpdump` on `tailscale0` showed them going out. They just never came back. It looks like a foreign-side problem when it is really a NAT-side problem.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=03-lan-tailscale0-firewall.sh" %}

The `tailscale0` zone is usually already present from the GL.iNet Tailscale package. What is not is the NAT entry that sets `target='MASQUERADE'` with `src='tailscale0'`. Add that and the forwarding entry, reload the firewall, and LAN traffic finally makes it through the tunnel end-to-end.

## Gotcha 2: PBR vs. Tailscale Precedence

Enabling the exit node the very first time did exactly what the docs suggested: it added a default route on `tailscale0`. It also broke the China split entirely. Every packet — CN and foreign — went to `tailscale0`.

The reason is how Tailscale registers its default route. It does not touch the `main` table; it installs a `default dev tailscale0` in table 52 and adds an IP rule at priority `5270` that says "look in table 52 for everything". PBR's own rules for its per-interface tables sit at priorities `30000` and above. `5270` is a much smaller number than `30000`, so Tailscale wins.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=01-ip-rule-ordering.txt" %}

The fix is to install early copies of PBR's rules at priorities `5261-5263`, ahead of Tailscale's `5270`. Any packet PBR marked as CN (fwmark `0x10000` or `0x30000`) hits one of the early rules first, lands on `pbr_wan`/`pbr_wwan`, and goes out the physical uplink. Anything not marked falls through to `5270` and rides Tailscale. The `pbr.user.china` script reinstalls these on every PBR reload, so they survive `service pbr reload` and boot.

Second gap that showed up in the same investigation: the original China PBR setup only populated `pbr_prerouting`, which handles forwarded traffic. Router-origin traffic (pings from the router shell, stubby's DoT connections, etc.) needed a matching `pbr_output` rule to be marked at all. That is why the script installs both.

## Gotcha 3: The GL.iNet 0x8000 Mark Leak

With PBR precedence fixed, LAN clients could reach Chinese sites just fine. Google, YouTube, Discord: TCP SYNs hung. Curl from the router itself against the same domains: 200 in two seconds. The router worked. LAN did not.

`conntrack -L` told the story immediately.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=05-conntrack-symptom.txt" %}

The reply direction had `dst=192.168.0.109`, which is the router's `sta0` (physical uplink) IP — not `100.106.152.123`, which is its tailnet IP. Translation: the LAN packet had been MASQUERADEd out `sta0`, not `tailscale0`. The Chinese ISP was either dropping or resetting the return traffic, and the handshake never completed. DNS looked fine because dnsmasq forwards to stubby, and stubby's own traffic goes through the exit node (correctly). But the actual TCP flow to Google was leaking out the physical uplink.

The culprit turned out to be GL.iNet's `vpn_table` nftables chain. Every unmarked LAN packet gets stamped with fwmark `0x8000`.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=04-vpn-table-0x8000-mark.nft" %}

Meanwhile, my `pbr.user.china` script had been installing an early IP rule at priority `5260`:

```
5260: from all fwmark 0x8000/0xf000 lookup main
```

That rule existed because in an earlier iteration I wanted to preserve GL.iNet's "direct" intent for `0x8000` packets. But GL now marks *all* LAN traffic that way, unconditionally. So pref `5260` was hijacking every single LAN packet to the `main` table (physical uplink) *before* Tailscale's pref `5270` rule ever got the chance to route it to the exit node.

The router itself was unaffected because router-origin traffic goes through `LOCAL_POLICY` instead of `ROUTE_POLICY`, and `LOCAL_POLICY` only marks packets from `skgid 10000`. That is why `curl` from the router shell worked and `curl` from a laptop on the LAN didn't.

Fix: stop installing pref `5260` entirely, and explicitly delete any lingering copy of it on every script reload so old deployments do not haunt me. The three real PBR marks (`0x10000`, `0x20000`, `0x30000`) still get their early rules at `5261-5263`, so China routing is unaffected. Verified live by `ip rule del pref 5260`; LAN YouTube loaded immediately.

## Operational Toggle

I move between wired ethernet and repeater mode a lot (hotel, home, cafe, home again), and periodically I leave China entirely. The script auto-detects the uplink so the mode switch is handled, but when I actually leave China I want the whole split-routing scheme turned off — foreign networks do not need CN direct paths, and the china-list adds unnecessary DNS latency.

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=07-pbr-toggle-runbook.sh" %}

The verification at the bottom is what I actually run whenever anything changes: check that the early PBR rules survived, then check that `1.1.1.1` routes via `tailscale0` and `223.5.5.5` routes via the physical uplink.

## What About an Allowlist-Only Model?

Every so often I get asked, or ask myself, why not flip this around: allowlist a handful of domains through the tunnel and leave everything else direct. Mechanically it is straightforward with the same plumbing — swap the china set for a `tunnel_set` and negate the match (`ip daddr != @tunnel_set -> mark`). Tailscale keeps ownership of the default route, PBR just does the marking, everything else carries over.

Practically it is a bad fit for the "living in China" use case. The whole 分流 (fēnliú, "traffic splitting") ecosystem — Clash, sing-box, v2ray/Xray, Surge, Quantumult X — ships "China direct, foreign proxy" as the default profile for a reason. The china-list is ~111k suffixes but externally maintained, so it costs the operator nothing. The reverse allowlist is a long tail of foreign CDNs, npm/pip mirrors, container registries, dev tools, and random SaaS that you get to keep current yourself, forever. And the failure mode of the negative model is friendlier: unknown domain gets tunneled and works, maybe slower; unknown domain in the positive model goes direct and silently fails or gets DNS-poisoned.

The allowlist model is real, it is just for different use cases — reaching CN-geolocked services from *outside* China via a CN VPS, corporate split-tunnel VPNs, privacy setups where only a couple of sites should leave via the tunnel. None of those are "escape the GFW".

## Steady State

Where this lands is: the router has been running the exit-node-plus-china-split configuration as its steady state for a few weeks now, across both repeater and wired modes, with LAN clients ranging from an Apple TV to a Windows gaming laptop to a Switch. Foreign traffic goes over Tailscale to the Debian VPS and comes back looking like it came from wherever the VPS lives. Chinese traffic hits AliDNS, gets a nearby POP, and takes the direct path. Neither side knows anything unusual is happening.

The Quantumult X setup still lives on the iPhone and MacBook and gives me per-app control when I want it — one profile for when I am on the Slate 7 and everything is already split for me, one for when I am on some random hotel wifi and every foreign packet needs to go over vmess. Two ways in, one VPS, one house LAN, and the boring properties I actually wanted from the start.
