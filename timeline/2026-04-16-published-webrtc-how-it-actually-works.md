---
title: "note: WebRTC — How it actually works"
date: "2026-04-16"
time: "21:15"
tags:
  - timeline
  - published
  - networking
  - security
---

I published [WebRTC — How it actually works](/notes/webrtc-how-it-actually-works/) as a note on how signaling, STUN/TURN, ICE, DTLS, and SRTP fit together. The useful framing here is that WebRTC is not just "peer-to-peer"; it is a browser-owned transport stack wrapped around signaling and fallback infrastructure you still have to run.
