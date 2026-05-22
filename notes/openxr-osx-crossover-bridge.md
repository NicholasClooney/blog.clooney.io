---
title: "Can CrossOver OpenXR Talk to OpenXR-OSX?"
date: 2026-05-22
tags:
  - vr
  - quest
  - macos
  - crossover
  - openxr
  - elite-dangerous
excerpt: |
  Notes on whether a Windows OpenXR app running in CrossOver can be bridged into OpenXR-OSX on macOS, and why that turns into a custom proxy-runtime problem instead of a simple runtime switch.
---

This note picks up where [Quest PCVR on Apple Silicon Mac via CrossOver](/notes/quest-pcvr-on-mac-notes/) and [Virtual Desktop / CrossOver Findings](/notes/vd-crossover-findings/) left off.

[[toc]]

## The question

I wanted to narrow the problem down to a more specific one:

- `Elite Dangerous` can already reach an `OpenXR` path inside `CrossOver`
- `OpenComposite` can already translate the game's `OpenVR` calls into `OpenXR`
- [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) now claims to provide an `OpenXR` runtime on `macOS`

So the obvious follow-up is:

`Can a Windows OpenXR app inside CrossOver be pointed at OpenXR-OSX on the Mac host?`

## Short answer

Not directly.

The `Elite -> OpenComposite -> Windows OpenXR loader -> ActiveRuntime` chain inside the bottle is real, but it still ends at a **Windows** runtime boundary. `OpenXR-OSX` is a **macOS** runtime that exposes a runtime manifest and a `dylib` on the host side. That is not something the Windows loader inside `CrossOver` can just consume as if it were another normal runtime JSON.

## What the Elite result actually proves

The earlier `Elite Dangerous` test was still useful.

It showed that:

- `Elite` can enter a VR path
- `OpenComposite` can intercept that path and forward it into `OpenXR`
- the Windows-side loader can discover an `ActiveRuntime` and attempt session startup

That means the app side is not completely dead. A Windows OpenXR application in a bottle can get far enough to try to talk to a runtime.

What it does **not** prove is that the app is close to talking to a host-native macOS runtime.

## Where the bridge breaks

### 1. The loader/runtime boundary is still Windows

On Windows, the `OpenXR` loader reads the active runtime from the registry, opens the runtime JSON, and loads the runtime shared library referenced by `library_path`.

That matters because a Windows process expects a Windows runtime binary at the end of that path.

In our case:

- the bottle can point `ActiveRuntime` at a Windows JSON
- that JSON is expected to point at a Windows runtime library
- `OpenXR-OSX` instead produces `openxr_osx.json` that points at `libopenxr_osx.dylib` on the macOS side

So even before headset tracking or frame timing enters the picture, the Windows process and the macOS runtime disagree on what a runtime binary even is.

## Why this is more than a manifest problem

Even if there were some hack to get the Windows side to accept a host-side runtime target, that still would not solve the actual runtime job.

An `OpenXR` runtime is not just a tracker service. It owns or strongly participates in:

- system discovery
- form-factor selection
- session creation
- swapchain creation
- graphics API bindings
- frame timing
- view poses
- input spaces
- frame submission

The application inside `CrossOver` is still a Windows application, which means its graphics expectations are expressed through Windows-side APIs and handles. The macOS runtime on the host side is built around its own runtime implementation and graphics interop path.

That is where this stops being a toggle and starts looking like a new compatibility layer.

## What a real bridge would need

The minimum plausible architecture looks more like a custom proxy runtime than a runtime switch.

### 1. A Windows runtime shim inside the bottle

There would need to be a Windows `OpenXR` runtime DLL that the Windows loader can discover and load normally.

Its job would be to:

- satisfy the Windows loader
- expose the expected runtime negotiation entry points
- implement enough of the OpenXR runtime surface to keep the app alive
- forward the real work somewhere else

### 2. IPC between the bottle and the host

That shim would then need to send runtime calls out of the Windows process and into a host-side service on macOS.

That means inventing a transport for things like:

- instance and session lifecycle
- system queries
- action and space state
- swapchain negotiation
- frame timing
- frame submission

The most plausible first pass would be:

- a `Unix domain socket` for local control and request/response traffic
- shared memory only later if image transport becomes too heavy for plain socket IPC

Other options exist, but they look weaker as a default:

- `localhost TCP` would be easy to inspect and debug, but it is a looser same-machine contract than a local socket
- shared memory from the start would optimize too early and make ownership and synchronization more painful before the bridge proves anything

So the basic shape would be:

- the Windows shim DLL is loaded by the `OpenXR` loader inside `CrossOver`
- the shim opens a connection to a host daemon, probably through a socket path like `/tmp/openxr-osx-bridge.sock`
- runtime requests are marshalled across that channel
- the host daemon replies with translated results and maintains the host-side object state

That also implies that raw runtime pointers and handles should not cross the boundary directly. The safer model is for the bridge to invent its own object IDs:

- Windows side: fake `XrInstance`, `XrSession`, and `XrSwapchain` handles backed by shim-side tables
- host side: matching bridge IDs mapped to real host objects

That keeps the protocol closer to “RPC with handle indirection” than “share implementation memory and hope.”

### 3. A host-side runtime service that speaks to OpenXR-OSX

On the macOS side, something would need to receive those calls and either:

- drive `OpenXR-OSX` directly as a lower-level runtime backend
- or reimplement enough runtime behavior itself to make the Windows client think it is talking to a normal runtime

### 4. Graphics marshalling

This is the ugliest part.

A Windows VR app does not just ask for poses and then stop. It submits rendered images through swapchains. Bridging that means solving how frames leave the translated Windows graphics world inside `CrossOver` and arrive in a form the macOS runtime can present to the headset path.

That is where I expect the project to become painful fast.

The split here is important:

- control plane: a socket-based RPC path is probably fine
- data plane: submitted frame images are where the bridge likely has to change shape

For a proof of concept, even the frame path could start with the same IPC channel just to prove call ordering and object lifetime. If it got far enough to submit real frames, I would expect the next redesign to be around image transport:

- shared memory ring buffers
- explicit synchronization primitives
- host-native presentation surfaces on the macOS side

That is the point where the project stops being “how do I send OpenXR calls across” and becomes “how do I transport VR frame data with survivable latency.”

There is also an important difference between sharing plain memory and sharing something that behaves like a real render target.

At the CPU-memory level, it should be possible in principle for a native macOS process and a `CrossOver`/Wine process to map the same shared region:

- POSIX shared memory
- `mmap`
- memory-mapped files

So a bridge could plausibly allocate shared memory on the host, map it on both sides, and use it as a copy-based transport buffer.

What does **not** follow from that is a clean zero-copy render path.

The Windows app still expects `OpenXR` swapchain images associated with a Windows-side graphics API. Even if both processes can see the same CPU-visible memory, that does not automatically mean:

- the app can render into that memory efficiently
- the translated graphics stack can export the submitted image there at the right time
- the host can consume it without extra copies
- synchronization and ownership rules will line up cleanly enough for VR timing

That is why host-side objects like `IOSurface` are only a partial answer. They can be useful once pixels already exist on the macOS side, but they do not solve the earlier problem of how a submitted frame escapes the Windows/CrossOver graphics path in the first place.

So the likely distinction is:

- shared memory between processes: feasible
- zero-copy shared render resources across the bottle/host boundary: much less plausible

If this bridge ever existed, the first version would probably be forced into a copy-based frame transport. That might be enough to prove architecture, but it would still leave open whether the latency budget is good enough for actual VR use.

## Likely failure order

If I actually tried to build this bridge, I would expect the blockers to arrive in roughly this order:

1. `xrCreateInstance` or loader negotiation mismatches
2. `xrGetSystem` and form-factor reporting mismatches
3. `xrCreateSession` failures because the graphics binding types do not line up cleanly
4. swapchain/image transport problems
5. timing and compositor behavior
6. latency ending up too high for usable VR even if the stack technically stays alive

That ranking matters because it means this is not just a “finish the loader” project. The deeper problems are still waiting after loader discovery works.

## Why this still does not look like a good Elite path

For `Elite Dangerous`, the full stack would be:

- `Elite`
- `OpenComposite`
- Windows `OpenXR` loader in the bottle
- custom proxy runtime shim
- IPC bridge
- host-side runtime adapter
- `OpenXR-OSX`
- Quest Android client

That is a lot of moving parts before even getting to motion-to-photon latency, controller mapping, audio, and long-session stability.

The earlier `Virtual Desktop` findings already showed that trying to piggyback on an unsupported Windows runtime stack inside `CrossOver` is fragile. This bridge idea avoids `Virtual Desktop Streamer`, but it replaces it with a different category of unsupported systems work.

## What seems realistic now

The realistic near-term use for [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) still looks like:

- native `macOS` `OpenXR` samples
- native `Unity` or `Godot` `OpenXR` applications built for `macOS`
- testing the project on its own terms with its Quest client

That is very different from “run Windows PCVR games in CrossOver and feed them into a host runtime.”

## Bottom line

The current `Elite` result is interesting because it proves the Windows app side can reach an `OpenXR` runtime boundary inside `CrossOver`.

But that boundary is still the wrong one.

Bridging a Windows OpenXR app in `CrossOver` to `OpenXR-OSX` on the host would require a custom Windows runtime proxy plus a host-side adapter, with graphics and swapchain transport as the likely hardest part. That makes it a runtime-bridge project, not a configuration exercise.
