---
title: "rtc-bridge — TCP tunneling from a browser, explained"
date: 2026-04-16
tags:
  - networking
  - webrtc
  - security
  - open-source
excerpt: |
  A friend built a tool that lets a browser reach local TCP services over WebRTC, no open ports, no install, no public IP required. I went down the rabbit hole understanding how it actually works.
---

A friend of mine — Andrew ([voltrevo](https://github.com/voltrevo)) — built a project called [rtc-bridge](https://github.com/voltrevo/rtc-bridge). The pitch is appealingly minimal: let a browser talk to local TCP services using WebRTC, without opening any ports, without a public IP, without installing anything on the client.

I spent some time chatting with AI agents to understand how it works, cross-referencing against what I know about WebRTC (see [my note on how WebRTC actually works](/notes/webrtc-how-it-actually-works/)). This is the write-up I wish I'd had at the start.

---

## The core idea

The usual problem: you have a service running locally — a database, a custom TCP server, whatever — and you want to reach it from a browser without exposing it to the internet. The normal solutions all require something: a VPN client install (Tailscale), open inbound ports (ngrok without the relay), a domain and TLS cert (Caddy), or a cloud relay in the data path (most ngrok-style tools).

rtc-bridge sidesteps all of this by using WebRTC's data channel as the transport. Once a WebRTC connection is established, you get a bidirectional byte stream. rtc-bridge uses that stream to proxy raw TCP traffic. The node running on your machine connects *outbound only* — to a coordinator — and the browser negotiates a WebRTC connection through that coordinator. After the handshake, the coordinator drops out of the data path entirely.

The mental model:

```
browser → WebRTC data channel → node → local TCP service
```

Nothing listens inbound on your machine. No firewall rules to touch.

---

## The three components

**Node** — runs on your machine. Connects outbound to the coordinator over WebSocket, registers its available services, and handles the actual TCP bridging once a WebRTC connection is established. It has an ed25519 keypair for identity.

**Coordinator** — a lightweight server whose only job is discovery and signaling. It knows what nodes exist and what services they expose, and it relays the WebRTC handshake (SDP offer/answer, ICE candidates) between browser and node. Once the WebRTC connection is up, the coordinator is out of the picture.

**Browser** — queries `/services` to see what's available, sends an SDP offer to `/offer`, gets the WebRTC connection established, then uses a simple data channel protocol to list services and open TCP tunnels.

---

## The connection flow

This follows the standard WebRTC signaling pattern:

1. Node connects to coordinator via WebSocket, registers itself
2. Browser hits `/services` to discover available nodes/services
3. Browser sends an SDP offer to `/offer` on the coordinator
4. Coordinator relays the offer to the target node
5. Node responds with an SDP answer, ICE candidates are exchanged
6. WebRTC connection is established — potentially direct P2P, potentially via TURN relay
7. Browser uses the data channel to send control messages, then raw TCP data

Before TCP bridging starts, there's a lightweight control protocol over the data channel:

- `ping` → `pong` — liveness check
- `list` → available services
- `challenge` / `verify` — node proves its identity using its ed25519 keypair
- `connect <service>` — opens the TCP tunnel

After `connect`, the data channel becomes a raw TCP stream. No framing on top.

---

## What the ed25519 keypair actually does

The node has a keypair and can prove its identity through a challenge/response exchange. This is solid — it means you can verify you're talking to the specific node you expect, not a spoofed one registered on the same coordinator.

But it's worth being clear about the boundary here: this authenticates **the node**, not **the user**. Anyone who can reach the coordinator and knows what to ask for can attempt a connection. The node identity check prevents *impersonation* of a known node, but it doesn't answer "is this browser allowed to connect at all?"

This is the gap the project doesn't currently address, and it's the right gap to be aware of if you're thinking about running this for anything beyond personal use.

---

## The P2P question

rtc-bridge is often described as peer-to-peer, with the coordinator "not in the data path after connection." That's conditionally true, and the condition matters.

WebRTC uses ICE to find the best available path. It tries direct paths first (host candidates, then STUN-reflexive candidates). If those work — typically when both sides are on non-restrictive networks — you get true P2P and the coordinator really is out of the picture.

But when direct paths fail, which happens routinely on mobile networks and in corporate environments with strict NAT or firewalls, ICE falls back to a TURN relay. TURN is a relay server that both sides connect to, and in that case traffic *does* route through a server. Whether rtc-bridge configures a TURN server, or assumes direct P2P will work, is worth checking against the actual repo before deploying this somewhere connectivity is unpredictable.

This isn't a critique of the design — it's just the reality of WebRTC. Direct P2P is the optimistic case. Plan for relay to be common.

---

## How it compares to what I'm already running

My home setup is Tailscale with Caddy for routing. Here's where they differ:

| | Tailscale + Caddy | rtc-bridge |
|---|---|---|
| Client requirement | Tailscale installed | Browser only |
| Transport | L7 HTTP via Caddy | L4 TCP tunnel via WebRTC |
| Exposure | DNS + TLS | Outbound only |
| Identity | Tailscale auth | ed25519 node keypair |
| User auth | Tailscale ACLs | Not yet |
| Reliability | DERP fallback always works | Depends on ICE/TURN config |

The conceptual difference is: my setup is a private network with managed ingress. rtc-bridge is a TCP tunnel from a browser — P2P when the network cooperates, relayed when it doesn't. They're solving adjacent problems differently.

rtc-bridge's big advantage is the zero-install client story. If you want to give someone browser-based access to a local service without them installing anything, this is a genuinely interesting approach. The trade-off is that you're giving up the auth and reliability story that a VPN gives you for free.

---

## The auth design question

One of the agents I was chatting with proposed a concrete auth design — coordinator-issued short-lived JWTs, verified by the node before accepting a `connect` command:

1. User authenticates to coordinator (OAuth, session, whatever)
2. Coordinator validates ACL, issues a signed token scoped to a specific node and service
3. Browser sends `auth <token>` before `connect <service>`
4. Node verifies the token — no user database required on the node side

The key properties: short-lived, scoped, verifiable without a round-trip to the coordinator. It's similar to how you'd design access tokens for any service boundary, and it's the right direction if this project ever needs to handle multiple users.

This is a proposed design, not a description of what's currently in the repo. The current version authenticates nodes, not users.

---

## Worth watching

The core concept is clean and the use case is real. Browser-native access to local TCP services without port exposure is genuinely useful — think local dev tools, home automation UIs, anything you'd normally reach over a VPN but don't want to require client software for.

The pieces I'd want to see before relying on it for anything sensitive: a clear TURN configuration story (so connectivity doesn't silently fail), and the auth layer described above. Neither is a fundamental limitation of the design — they're just not there yet.

Andrew's other work suggests he thinks carefully about these problems. Worth keeping an eye on.
