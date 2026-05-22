---
title: "Minimal OpenXR-OSX MVP: hello_xr on Quest from macOS"
date: 2026-05-22
tags:
  - vr
  - quest
  - macos
  - openxr
  - hello-xr
excerpt: |
  A smallest-possible test plan for getting a native macOS hello_xr sample talking to OpenXR-OSX and displaying through the Quest client.
---

This is the narrowest test I would try first if the goal is to prove that [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) can drive a `Quest` headset from a native `macOS` `OpenXR` application.

[[toc]]

## Scope

This is not a guide for `CrossOver`, `SteamVR`, or `Elite Dangerous`.

It is a smaller question:

`Can I run a native macOS OpenXR sample, point it at OpenXR-OSX, and see that path come alive on the Quest client?`

If this fails, there is no point making the Windows-side experiments more complicated.

## Short version

The smallest credible MVP looks like this:

1. build the `OpenXR-OSX` runtime on the Mac
2. register the runtime for shell-launched apps with `XR_RUNTIME_JSON`
3. build and install the Quest Android client from the same repo
4. build a native macOS `hello_xr`
5. run `hello_xr` from the same shell so it picks up the runtime

If that path does not work, I would stop there and debug it before touching `CrossOver` again.

## What this should prove

If successful, this test should prove a few things at once:

- the `OpenXR-OSX` runtime builds and loads
- the runtime can be discovered by a native macOS `OpenXR` app
- the Quest client can find the runtime on the local network
- the runtime can create a session and begin presenting frames through the Quest path

It does **not** prove anything about Windows games, `OpenComposite`, or the `CrossOver` bridge idea.

## Prerequisites

Upstream currently documents these requirements for the supported path:

- `Apple Silicon Mac`
- `macOS 13+`
- `Xcode` and command line tools
- `cmake`
- `ninja`
- `Java 17`
- `Android SDK`
- `Android NDK`
- `adb`
- `Quest` in developer mode

Docs:

- [`OpenXR-OSX` README](https://github.com/demonixis/OpenXR-OSX)
- [`docs/build.md`](https://github.com/demonixis/OpenXR-OSX/blob/main/docs/build.md)
- [`docs/platforms/quest.md`](https://github.com/demonixis/OpenXR-OSX/blob/main/docs/platforms/quest.md)
- [`docs/platforms/macos-companion.md`](https://github.com/demonixis/OpenXR-OSX/blob/main/docs/platforms/macos-companion.md)

## Minimal sequence

### 1. Build the macOS runtime

From the local fork:

```bash
cd ~/Source/Forks/fork-OpenXR-OSX
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Debug
cmake --build build
ctest --test-dir build --output-on-failure
```

Expected outputs:

- `build/runtime/libopenxr_osx.dylib`
- `build/runtime/openxr_osx.json`
- `build/runtime/openxr_osx.toml`

### 2. Register the runtime for terminal-launched apps

For the first test, I would avoid GUI registration and use the shell path documented upstream:

```bash
export XR_RUNTIME_JSON="$HOME/Source/Forks/fork-OpenXR-OSX/build/runtime/openxr_osx.json"
```

That keeps the first run simpler than using the helper script or the macOS companion app.

### 3. Build and install the Quest client

```bash
cd ~/Source/Forks/fork-OpenXR-OSX/clients/android-openxr
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

Upstream notes that `clients/android-openxr/local.properties` must point at the local Android SDK.

### 4. Launch the Quest client

On the headset:

- open the installed Android client
- keep the headset awake
- keep the Mac and Quest on the same local network

Example `adb` install and launch commands:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.openxrosx.client -c android.intent.category.LAUNCHER 1
```

If more than one `adb` device is attached, target the headset explicitly:

```bash
adb -s <device-id> install app/build/outputs/apk/debug/app-debug.apk
adb -s <device-id> shell monkey -p com.openxrosx.client -c android.intent.category.LAUNCHER 1
```

The documented behavior is that the Quest client discovers the runtime on the local network, connects, receives encoded frames, and sends head/controller data back.

### 5. Build native macOS `hello_xr`

For the sample itself, use Khronos’ `OpenXR-SDK-Source`, where `hello_xr` lives.

Minimal documented macOS generation path:

```bash
git clone https://github.com/KhronosGroup/OpenXR-SDK-Source.git
cd OpenXR-SDK-Source
mkdir -p build/macos
cd build/macos
cmake -G Xcode ../..
```

Then build the `hello_xr` sample target from the generated Xcode project.

Khronos references:

- [`OpenXR-SDK-Source`](https://github.com/KhronosGroup/OpenXR-SDK-Source)
- [`OpenXR-SDK` macOS build notes](https://github.com/KhronosGroup/OpenXR-SDK)

### 6. Run `hello_xr` from the same shell

This matters because the shell still needs `XR_RUNTIME_JSON` set when the sample launches.

The first run should be from the same terminal session used in step 2, not from Finder, Spotlight, or a different shell window.

## What counts as success

Minimum success would look like:

- `hello_xr` does not fail immediately at runtime discovery
- the Quest client connects instead of sitting at its standby/loading colors
- session creation succeeds
- headset motion affects the sample path instead of failing before presentation

The project itself warns that the current Quest interface is still minimal, so “working” may still look rough.

## What actually worked

I ran this test for real against a locally built [`OpenXR-OSX`](https://github.com/demonixis/OpenXR-OSX) runtime and a sideloaded Quest client.

The working `hello_xr` invocation on `macOS` was:

```bash
XR_RUNTIME_JSON=~/Source/Forks/fork-OpenXR-OSX/build/runtime/openxr_osx.json \
~/Source/Forks/OpenXR-SDK-Source/build/macos/src/tests/hello_xr/Debug/hello_xr \
  -g Metal
```

The `-g Metal` flag mattered. Running `hello_xr` without a graphics backend just printed usage and exited.

The Quest client initially showed the documented blue standby screen. Once `hello_xr` started a real `OpenXR` session, the headset connected to the host and moved from standby into the actual `hello_xr` scene.

What I saw in the headset matched the expected sample output: a teal background with a few simple 3D cubes. That is enough to count as a successful native `macOS -> OpenXR-OSX -> Quest` path.

Here is the short clip from that successful run:

<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://www.youtube.com/embed/slwVUBdZR1Y"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    title="OpenXR-OSX hello_xr on Quest from macOS"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen>
  </iframe>
</div>

## Host-side evidence

The most useful host log lines from the successful run were:

- `StreamingServer: Broadcasting on ...`
- `OpenXR OSX: Streaming server started, waiting for headset connection...`
- `OpenXR OSX: Client connected (Quest), receiving tracking`
- `StreamingServer: Client connected: Quest (... ) refresh=72Hz`
- `VideoEncoder: Initialized H.265 encoder ... @ 72fps`

That confirms the full chain:

- native `macOS` `hello_xr`
- `OpenXR-OSX` runtime negotiation
- `Metal` session creation
- Quest discovery over LAN
- tracking back to host
- H.265 video encoding
- frame queueing into the headset streaming path

One useful architectural detail became clearer during the real run: the `StreamingServer` is part of the `OpenXR-OSX` runtime, not a separate app and not part of `hello_xr` itself. `hello_xr` is just a normal `OpenXR` application. Once it starts a real session through the runtime, `OpenXR-OSX` spins up its own discovery, tracking, and video streaming path for the Quest client.

## Performance notes from the successful run

The successful run negotiated `72Hz` on the headset side.

From the live host and Quest logs, the useful numbers were:

- negotiated refresh: `72Hz`
- encoder target: `72fps`
- Quest-side decode time: roughly `10-12ms`
- Quest-side compositor time: roughly `1ms`
- Quest-side total receive-to-submit time: roughly `11-13ms`
- render-pose match rate: usually `98-100%`

The stream was stable enough to hold the sample scene for an extended run, but it was not perfectly clean:

- there were occasional `NACK` retransmits
- occasional keyframe requests
- one early encoder drop
- adaptive bitrate stepped down from the initial `50Mbps` toward the low `30Mbps` range during the longer run

I do not think those drops should be treated as a clean verdict on the runtime by themselves. This test was run in a network environment that was not set up especially carefully for low-latency wireless streaming, so the visible patchiness and some of the retransmit/keyframe activity should be read with that caveat in mind.

## 90Hz retest

I later patched the Quest client to use `XR_FB_display_refresh_rate`, request `90Hz` when supported, and log the negotiated result.

That retest worked:

- the Quest client reported the server at `90Hz`
- the Quest client sent `ClientConnect ... (refresh=90Hz)`
- the host logged `Client connected: Quest ... refresh=90Hz`
- the encoder initialized at `90fps`

The 90Hz run was therefore real, not just a host-side assumption.

At `90Hz`, the logs still showed some retransmits, keyframe requests, and skipped frames, but the same networking caveat still applied: this was not a tightly controlled wireless test environment. So the right conclusion is that `90Hz` is supported and functioning, not that the stream quality limits are purely runtime-side.

So the current result is not “production quality PCVR,” but it is absolutely enough to prove that the architecture works on its own terms, including a successful `90Hz` path.

## Practical gotchas discovered on the way

- `hello_xr` on desktop needs an explicit graphics backend; on this path, use `-g Metal`.
- Running `hello_xr` non-interactively can make it tear down immediately after printing `Press any key to shutdown...`, so a live terminal session is better for connection testing.
- The Quest client does log useful decoder/network stats, but the clearest connection confirmation came from the host runtime logs.
- Wireless `adb` worked fine for install and launch, so USB was not required once pairing was already set up.

## Likely failure order

If this goes wrong, I would check in this order:

1. runtime build artifacts actually exist
2. `XR_RUNTIME_JSON` points at the right `openxr_osx.json`
3. the Quest APK really installed
4. the headset app is open and the headset is awake
5. Mac and Quest are reachable on the same network
6. only then start reading runtime or sample logs

## Why I want this before more bridge work

The `CrossOver` notes already showed that the Windows side can hit a runtime boundary, but the bridge problem is much harder than the native path.

If `OpenXR-OSX` cannot get a native macOS `hello_xr` talking to the Quest client, then trying to route `Elite`, `OpenComposite`, and a custom runtime shim into it would be upside down.

## Bottom line

This is the right first test because it strips the problem back to the smallest architecture that the project actually claims to support today: native `macOS` `OpenXR` app, `OpenXR-OSX` runtime, and Quest Android client.
