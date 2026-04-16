---
title: "WebRTC — How it actually works"
date: 2026-04-16
tags:
  - networking
  - security
excerpt: |
  A practical mental model for WebRTC: you build signaling, the browser handles ICE/DTLS/SRTP, and TURN is the fallback when direct paths fail.
---

WebRTC lets browsers and native apps exchange audio, video, and arbitrary data in real time - without routing everything through a server. The "peer-to-peer" framing is appealing, but it elides a lot: you still need to build signaling, operate STUN/TURN servers, and design fallback paths for the connections that never go direct.

Under the hood, WebRTC is two largely separate concerns stacked together: a *signaling layer* you design entirely yourself, and a *transport layer* the browser owns.

> **Mental model:** Signaling (you build) + NAT traversal via STUN/TURN + encrypted P2P transport (browser) = WebRTC

---

## Key components

Five pieces interact to get a connection established. Three of them you operate; two are handled by the browser runtime.

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin:1.5rem 0;font-family:system-ui,sans-serif">
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#8b7ff5;margin-bottom:10px;font-weight:500">Signaling server</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">Not part of the WebRTC spec. You build it. Exchanges SDP offers/answers and ICE candidates between peers. Commonly WebSocket or Socket.IO.</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#5b9bd5;margin-bottom:10px;font-weight:500">STUN</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">Answers "what does my public IP/port look like?" Cheap to run, needed for most P2P paths.</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#5ba85b;margin-bottom:10px;font-weight:500">TURN</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">Full relay fallback. Traffic routes through your server when direct P2P fails. Bandwidth costs scale with usage.</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#c8a040;margin-bottom:10px;font-weight:500">ICE</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">Gathers candidate paths (host, STUN-reflexive, TURN-relay), tests them in parallel, picks the best working route.</div>
  </div>
  <div style="background:#1e1e1e;border:1px solid #333;border-radius:10px;padding:16px">
    <div style="font-family:monospace;font-size:13px;color:#d47fa0;margin-bottom:10px;font-weight:500">SFU (optional)</div>
    <div style="font-size:13px;color:#ccc;line-height:1.6">For multi-party calls. Each peer sends once; the SFU fans out. Avoids O(n²) mesh connections. Examples: mediasoup, LiveKit.</div>
  </div>
</div>

---

## Connection flow

A connection goes through six ordered phases. The first three happen over your signaling channel; the rest are handled by the browser.

**01 — Signaling setup**
Both peers connect to the signaling server and join a session or room.

**02 — Offer / Answer (SDP exchange)**
Caller generates an SDP offer; callee responds with an SDP answer. Encodes codecs, media types, and encryption params.

**03 — ICE candidate exchange**
Each peer gathers candidates (local, STUN-reflexive, TURN-relay) and sends them through the signaling channel.

**04 — Connectivity checks**
ICE runs STUN binding requests on every candidate pair until it finds a working path.

**05 — Secure transport setup**
DTLS key exchange, SRTP for media, SCTP over DTLS for data channels. All mandatory - WebRTC is always encrypted.

**06 — Transmission**
Direct P2P if ICE found a working path. Relay via TURN otherwise. Most corporate/mobile connections fall back to relay.

---

## Protocol stack

| Protocol | Layer | What it does |
|----------|-------|--------------|
| SDP | Signaling | Session description - codecs, media types, crypto params |
| ICE | Transport | Path discovery, candidate testing, route selection |
| STUN | Transport | NAT mapping discovery - "what is my public address?" |
| TURN | Transport | Relay server when direct P2P fails |
| DTLS | Security | Encryption handshake over UDP |
| SRTP | Media | Encrypted audio/video transport |
| SCTP | Data | Data channel transport, runs over DTLS |

---

## Tradeoffs

<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:1.5rem 0;font-family:system-ui,sans-serif">
  <div style="background:#1a2e1a;border:1px solid #2d4a2d;border-radius:10px;padding:16px 20px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;color:#5ba85b;margin-bottom:12px;font-weight:500">Strengths</div>
    <ul style="list-style:none;padding:0;margin:0">
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Sub-100ms latency on good P2P paths</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Encryption is mandatory, not optional</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Ships in every browser - no plugin</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Carries both media and arbitrary data</li>
    </ul>
  </div>
  <div style="background:#2e1a1a;border:1px solid #4a2d2d;border-radius:10px;padding:16px 20px">
    <div style="font-family:monospace;font-size:11px;letter-spacing:0.07em;text-transform:uppercase;color:#c06060;margin-bottom:12px;font-weight:500">Watch out for</div>
    <ul style="list-style:none;padding:0;margin:0">
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Signaling + NAT setup complexity is non-trivial</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>TURN bandwidth costs scale with load</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Not always truly P2P - TURN relay is common</li>
      <li style="font-size:14px;color:#ccc;padding:4px 0;display:flex;gap:10px"><span style="color:#555">-</span>Debugging ICE failures is painful</li>
    </ul>
  </div>
</div>

---

> **Key insight:** Despite the "peer-to-peer" marketing, many real-world WebRTC connections route through TURN relays - particularly on mobile networks and in corporate environments with strict NAT or firewalls. Plan for your TURN server to carry a meaningful fraction of your traffic.
