---
title: "Getting Pulled Into the Ethereum Ecosystem (From a Digital Garden Perspective)"
date: 2026-04-16
eleventyNavigation:
  key: getting-pulled-into-the-ethereum-ecosystem
tags:
  - ethereum
  - blockchain
  - digital-garden
  - publishing
  - reflection
  - personal
excerpt: |
  A 3am rabbit hole into Ethereum from the perspective of a markdown-based digital garden: ledgers, trust minimization, on-chain verification, and what a hybrid publishing model could look like.
---

It started, as a lot of things do, at 3am on WhatsApp.

I'd been telling my friend Andrew about the timeline feature I'd been building for my blog — a personal log, colour-coded by entry type, populated by an agent skill I wrote. He said he needed something similar, and I told him to steal it. Then I mentioned I'd been really enjoying iterating my digital garden: shaping it however I want, no limits.

His response: *"this makes me want to bring you into the ethereum ecosystem"*

*"wdym?"*

*"that word 'garden' is popular in ethereum space — eg 'infinite garden'"*

*"bring me on!"*

And that was it. I spent the next hour going down a rabbit hole, partly with Andrew, partly with ChatGPT, trying to actually understand what Ethereum means and whether it has any relevance to a markdown-based personal blog.

Here's what I came away with.

---

## The mental model that clicked

I hadn't been thinking about Ethereum much at all — it was just "crypto stuff" in the background.

The framing that actually landed for me: **Ethereum is a shared, global state machine where code executes deterministically.** Everyone who interacts with it sees the same result. No central authority controls the outcome. You don't have to trust the operator — you can verify things independently.

That last part is the key philosophical shift. My blog currently runs on a trust model that says: *"trust me (the author / the server / the Git history)"*. And Git history is actually rewritable. Timestamps are controlled by whoever owns the server. You're trusting the operator.

A ledger-based system flips that. The verification model becomes: *"verify it independently."* Immutable history. Cryptographic authorship proof. Globally agreed ordering.

The distinction isn't "verifiable vs not verifiable" — it's **trust-based vs trust-minimized**.

---

## What a ledger actually is

I kept hearing "ledger" and thinking of an accounting book. Which is actually close.

A ledger is an append-only record of events over time. Ordered. Historical. No silent rewriting. Think bank statement, or Git commit history — except Git lets you rebase.

Ethereum's ledger is a shared, tamper-resistant timeline of transactions and events. Each entry is signed by a wallet, validated by the network, and has a globally agreed order. No one can go back and change what happened.

Andrew put it well when I asked about updating posts: there's a separation between transaction history and resulting state. You can program a smart contract to update its state however you like — but the *history* of those updates can't be changed. 

*"Kind of like git history but not rewritable lol"* I said.

*"yeah I was gonna say exactly that haha"* Andrew replied.

---

## What Ethereum actually verifies (and what it doesn't)

Ethereum verifies:
- A specific wallet signed and submitted a transaction
- The transaction was valid at the time
- The resulting state change occurred
- The exact data that was submitted

Ethereum does **not** verify:
- That the wallet belongs to you specifically
- Whether the content is truthful or genuine
- What the data *means*
- Anything about external reality

The ledger verifies that **a specific wallet performed an action**. The link between you-as-a-person and your wallet is still a trust claim — just one you make once (by publicly associating your wallet with your identity) rather than on every post. That's meaningfully different from the current blog model, but it's not the same as proof of authorship.

That's not a weakness. It's just the right mental model for what the system actually does: given a wallet address and a transaction, anyone in the world can independently verify that it happened, exactly when it happened, and that the record hasn't been tampered with. That's the guarantee — narrow, but very strong.

---

## How this could apply to a blog

The natural pattern here is an on-chain/off-chain split.

**On-chain:** post title, slug or content hash, author wallet address, timestamp, event log.

**Off-chain:** the full markdown content, rendering, media.

The principle is: *put the anchor on-chain, not the full content.* Storing full blog posts on-chain would be expensive (gas costs), permanent in ways that are hard to manage, and technically awkward. Smart contracts aren't designed as a CMS. But storing a hash of the content on-chain lets anyone independently verify that the content hasn't changed since it was registered.

The verification flow becomes: fetch the post → compute the hash → compare with the on-chain hash. If they match, content integrity is verified.

---

## The sync problem

This is where it gets interesting as a design problem. If your blog and your blockchain records can diverge, you now have two sources of truth.

There are three ways to handle this:

**Option A — Chain as source of truth.** All posts must be recorded on-chain. The site reads from the chain. Strong consistency, but high friction for publishing.

**Option B — Site as source of truth (soft ledger).** The blog is primary, the chain is an optional proof layer. Flexible, low friction, but only partial verification.

**Option C — Hybrid (recommended).** Introduce explicit states: `draft`, `published`, `verified`. Surface these in the UI — a checkmark for verified, a tilde for not-yet-recorded, an exclamation for mismatch.

The key insight from Option C: **conflicts become visible system states, not hidden problems.** You're not pretending everything is consistent when it isn't — you're designing for the reality that a post might exist on the blog before it exists on-chain.

---

## Starting out: Sepolia testnet

Andrew suggested starting with Sepolia, which is essentially a sandbox version of Ethereum. Same mechanics as mainnet, uses test ETH (no real monetary value), safe for experimentation. He also mentioned mainnet is pretty cheap these days if I wanted to go further — you can get Sepolia ETH for free in small amounts from faucets.

The suggested starting point: use Foundry (a Solidity development environment) to write and deploy a contract to Sepolia, and get an agent to walk through what's actually happening. That's the next step.

---

## The philosophical bit

What made this conversation click for me beyond the technical details was arriving at my own framing of what the Ethereum Foundation is actually doing. The protocol is like the fabric of an Ethereum universe — and the foundation wants people to build on it - to populate that universe in a way - in their own creative ways. That's the "infinite garden" metaphor: a shared substrate that anyone can grow things on. Andrew confirmed I'd got it right.

My blog is already a small personal, digital garden. The interesting question is what it would mean to root some of it into a shared, verifiable layer. Not for the permanence per se — but for what the trust model change means for how I think about publishing.

Current framing: *"I control and present my history."*

Ledger-enhanced framing: *"I publish my history into a shared, verifiable system."*

There's something worth sitting with there.

---

## What's next

- Set up Foundry and deploy a toy contract to Sepolia
- Write a minimal `PostRegistry` contract that emits a `PostCreated` event with title, slug hash, and author
- Build a verification script that checks a local post's hash against the on-chain record
- Think through what the `draft → published → verified` state machine looks like in practice on the blog

I'll write up each step as I go. The goal isn't to turn this into a web3 blog — it's to understand the ecosystem from the inside, by building something small and concrete with it.

More soon.

---

*Thanks to Andrew Morris for the 3am rabbit hole.*
