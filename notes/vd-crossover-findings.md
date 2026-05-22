---
title: "Virtual Desktop / CrossOver Findings"
date: 2026-05-22
tags:
  - vr
  - virtual-desktop
  - crossover
  - openxr
  - troubleshooting
excerpt: |
  Notes from testing Virtual Desktop Streamer inside CrossOver bottles, including launch failures, unstable OpenXR sessions, and why the setup still collapses even after fixing .NET.
---

Findings from testing `Virtual Desktop Streamer` inside multiple `CrossOver` bottles on macOS, with a focus on launch behavior, `OpenXR` runtime status, and where the setup breaks down.

[[toc]]

## Bottles

- `Test`
- `VD Test 2`

## Summary

Two distinct issues showed up:

1. In `Test`, `Virtual Desktop Streamer` launches, but the VR session is unstable and disconnects on its own.
2. In `VD Test 2`, `Virtual Desktop Streamer` currently fails to launch because `mscoree.dll` is not being loaded for the app at startup.

## `Test` Bottle

### OpenXR runtime registration

`Test/system.reg` contains:

- `HKLM\\Software\\Khronos\\OpenXR\\1\\ActiveRuntime` -> `C:\\Program Files\\Virtual Desktop Streamer\\OpenXR\\virtualdesktop-openxr.json`
- `HKLM\\Software\\WOW6432Node\\Khronos\\OpenXR\\1\\ActiveRuntime` -> `C:\\Program Files\\Virtual Desktop Streamer\\OpenXR\\virtualdesktop-openxr-32.json`

The referenced JSON files exist in the bottle.

### Elite Dangerous

Elite is configured to launch in VR through the Virtual Desktop game settings:

- app id `359320`
- `/Steam /VR`
- `OpenVRSupport: true`

### SteamVR route

SteamVR logs showed Elite trying to initialize VR, but failing with headset/runtime errors:

- `VRInitError_VendorSpecific_OculusRuntimeBadInstall`
- `VRInitError_Init_HmdNotFound`

Elite did enter a VR path, but `SteamVR` never got a usable headset.

### OpenComposite route

Per-game OpenComposite DLLs were placed into Elite's local OpenVR folders:

- `.../Openvr/win64/openvr_api.dll`
- `.../Openvr/win32/openvr_api.dll`

Observed behavior after that:

- With global OpenComposite enabled, Steam startup failed with:
  - `OpenComposite DLLMain ERROR: Cannot init VR: unsupported apptype 6`
- With global runtime switched back to SteamVR and only the per-game DLL hook left in place, Elite reached:
  - `Elite -> OpenComposite -> Virtual Desktop OpenXR runtime`

OpenComposite then failed with two main error modes:

- `XR_ERROR_FORM_FACTOR_UNAVAILABLE` at `xrGetSystem(...)`
- `XR_ERROR_RUNTIME_FAILURE` at `xrCreateSession(...)`

Interpretation:

- `FORM_FACTOR_UNAVAILABLE`: the runtime loaded, but no `HMD` was exposed at that moment
- `RUNTIME_FAILURE`: the runtime got farther, but session creation failed

### `hello_xr.exe` probe

The prebuilt `hello_xr.exe` from the OpenXR loader package was also tested in the `Test` bottle.

Observed behavior:

- starts and exits immediately
- sometimes returns `1`
- Virtual Desktop connection can drop at the same time

This points to the same underlying problem as the `OpenComposite` test: the `VDXR/OpenXR` path is unstable in the bottle, and the issue is not specific to `Elite`.

### Current conclusion for `Test`

The limiting issue in `Test` is upstream of Elite:

- `Virtual Desktop Streamer` disconnects on its own
- OpenXR session startup is unstable
- app-level VR failures are downstream symptoms

## `VD Test 2` Bottle

### What was checked

- VC++ runtime files are present
- changing the bottle to Windows 10 did not fix launch
- install footprint in `Program Files` is broadly similar to `Test`

So the fresh bottle does not appear to be blocked mainly by VC++ or the selected Windows version.

### App logs

`Virtual Desktop Streamer` does not create useful app logs before failing in `VD Test 2`.

That suggests it is failing very early in startup.

### CrossOver launch logs

Useful log files:

- `~/Library/Logs/CrossOver/VD Test 2.cxlog`
- `~/Library/Logs/CrossOver/VD Test 2 2.cxlog`

The newest run in `VD Test 2 2.cxlog` shows the relevant failure:

- `VirtualDesktop.Streamer.exe` starts
- then:
  - `Failed to load module L"mscoree.dll"; status=c0000135`
  - `mscoree.dll not found, IL-only binary L"VirtualDesktop.Streamer.exe" cannot be loaded`
  - `Importing dlls for L"C:\\Program Files\\Virtual Desktop Streamer\\VirtualDesktop.Streamer.exe" failed, status c0000135`

That is the current hard blocker for launching the app in `VD Test 2`.

### Other noise seen in the same log

The same log also contains:

- `failed to create driver ... Services\\winebth`
- `Auto-start service L"winebth" failed to start: 1359`
- `RPC_S_SERVER_UNAVAILABLE`

These may matter later, but the first app-specific failure in the latest log is still the `mscoree.dll` load failure.

## OpenXR loader package

Downloaded package:

- `~/Downloads/openxr_loader_windows-1.1.60.zip`

Useful contents:

- `x64/bin/hello_xr.exe`
- `x64/bin/openxr_runtime_list.exe`
- `x64/bin/openxr_loader.dll`
- `x64/lib/openxr_loader.lib`
- `include/openxr/openxr.h`
- `include/openxr/openxr_platform.h`

This package is enough to run a probe like `hello_xr.exe` without building anything locally.

## Working diagnosis

### `Test`

- Virtual Desktop launches but the runtime/session path is unstable
- VDXR/OpenXR under CrossOver is not stable enough to trust yet

### `VD Test 2`

- Virtual Desktop currently does not launch because `mscoree.dll` is not loading for the app
- this looks like a .NET/CLR bootstrap issue in the fresh bottle

### `VD Test 3`

- fresh bottle
- `.NET 4.8` installed first
- `Virtual Desktop Streamer` launches
- Quest can connect briefly
- then the connection still drops on its own

This matters because it rules out the simpler explanation that the whole failure was just a missing `.NET` dependency in a fresh bottle.

## Updated conclusion

The repeated disconnects across bottles point to a deeper compatibility problem:

- `Virtual Desktop Streamer` expects a real Windows desktop/session and graphics capture path
- a CrossOver bottle does not provide a normal Windows display/compositor environment
- the streamer can appear to start and accept a connection, but there is no real Windows desktop for it to present
- after that, the session drops and OpenXR/VDXR calls fail further downstream

The current best explanation is a platform mismatch:

- running the Windows `Virtual Desktop Streamer` inside CrossOver is not a stable foundation for VR runtime or headset tracking
- Elite/OpenComposite/OpenXR errors are downstream symptoms of that mismatch

## macOS streamer note

Virtual Desktop's official site distinguishes between:

- desktop streaming on macOS
- PCVR game streaming on Windows

Their current FAQ says PCVR game streaming requires a VR-ready PC running Windows and "won't work on a Mac".

That means the macOS streamer should be treated as a desktop-streaming path, not a supported PCVR runtime path, and it should not be assumed to expose a usable `OpenXR`/`SteamVR`-compatible tracking interface.

This lines up with the observed behavior in CrossOver:

- brief connection
- no real Windows desktop/session behind the bottle
- disconnects soon after connection
- downstream OpenXR failures

## Head pose question

### From Virtual Desktop Streamer on macOS

No documented or supported head-pose API was identified for the macOS Virtual Desktop Streamer.

### From ADB / debug tooling

No standard ADB command or generic debug feed was identified that exposes live Quest head pose from the currently running Virtual Desktop session.

ADB is useful for:

- install / launch
- `logcat`
- shell access
- developer workflows

It is not a general supported source of live headset pose from an arbitrary foreground VR app.

### Practical takeaway

If the real goal is extracting Quest 3 head motion data, the reliable architecture is likely:

- a native Quest app that reads pose from the headset runtime and sends it out
- or a real Windows PCVR/runtime path that exposes tracking through a supported API

The `Virtual Desktop on Quest + macOS streamer + CrossOver bottle` path should not be treated as a dependable source of head pose.

## Next steps

1. Stop treating this as mainly an Elite configuration problem.
2. Assume the Windows Virtual Desktop Streamer inside CrossOver is not a reliable path unless a real Windows desktop/session is available.
3. If the goal is headset tracking or VR runtime access, look for a path that does not depend on the Windows streamer running inside a bottle.
