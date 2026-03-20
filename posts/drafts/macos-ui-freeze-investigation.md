---
draft: true
---

# macOS UI Freeze Investigation Report
**Date:** 2026-03-19
**Time:** ~20:40–20:52 GMT
**Platform:** macOS 26.1 (25B78), Apple Silicon (ARM64)

---

## Symptoms

- Full UI freeze with spinning beach ball across all apps
- Stage Manager sidebar visible but unresponsive
- Keyboard shortcuts (cmd+tab, Spotlight, etc.) not responding
- Mouse/trackpad clicks not registering
- Terminal remained fully responsive throughout

---

## Investigation

### Step 1: Process Analysis

Initial `ps` and `top` revealed severe resource pressure:

| Process | CPU | RAM |
|---------|-----|-----|
| OBS | 29.9% | — |
| WindowServer | 28.5% | 192MB |
| VLC | 22.6% | 567MB |
| coreaudiod | 20.6% | — |
| Firefox (8+ processes) | ~30% combined | ~3.9GB |
| Slay the Spire 2 | — | 1.4GB |
| Virtualization VM | — | 3.1GB |
| lldb-rpc-server (Xcode) | — | **6.3GB** |

**Total free RAM:** ~470MB (critical — near exhaustion)
**Swap activity:** 659K swapins / 1.15M swapouts (severe)

### Step 2: Root Cause — Memory Exhaustion + Swap Storm

The system had ~35GB used with only 470MB free. Heavy swap activity (1.15M swapouts) caused cascading latency across all processes. WindowServer entered a degraded `Rs` (running/stuck) state under the pressure.

**Biggest single offender:** `lldb-rpc-server` (PID 2430) — Xcode's LLDB debugger server had leaked to **6.3GB** of RAM, far beyond normal. This was the primary trigger for the swap storm.

### Step 3: Remediation Attempts

Killed the following processes:
- `lldb-rpc-server` (PID 2430) — freed ~6GB
- Virtualization VM (PID 1670) — freed ~3.1GB
- Slay the Spire 2 (PID 44402) — freed ~1.4GB
- Firefox (all processes) — freed ~3.9GB
- OBS (PID 81773)
- VLC (PID 76292)

**Result:** Free RAM recovered to ~12.5GB. CPU pressure dropped significantly. However UI remained frozen.

Also restarted UI subsystems:
```bash
killall Dock Finder SystemUIServer
```
**Result:** No improvement — UI still frozen.

### Step 4: Deadlock Discovery

Sampled the Dock process (`sample $(pgrep -x Dock) 1`) and found a **Mach IPC deadlock**:

```
Dock main thread (852/852 samples):
  _window_spaces_notification_handler  (SkyLight)
    → dispatch_mach_send_with_result_and_wait_for_reply
      → mach_msg
        → mach_msg2_trap   ← BLOCKED HERE
```

Dock had sent a Spaces/Stage Manager notification to WindowServer and was indefinitely blocked waiting for a reply that never came. WindowServer was not processing its message queue.

### Step 5: Keyboard Input Explained

All keyboard shortcuts (cmd+tab, Spotlight, etc.) were non-functional because **WindowServer owns the system input event pipeline**. Every keyboard and mouse event is routed through WindowServer before reaching any app. With WindowServer deadlocked, the entire input system was frozen — not just the UI rendering.

---

## Root Cause Summary

1. **`lldb-rpc-server` memory leak** triggered a swap storm by consuming 6.3GB
2. **Cascading memory pressure** from multiple heavy apps (VM, game, Firefox, OBS, VLC) exhausted RAM
3. **WindowServer became degraded** under resource pressure
4. **Stage Manager triggered a Mach IPC deadlock** — Dock sent a Spaces notification that WindowServer never acknowledged, causing Dock's main thread to block indefinitely on `mach_msg2_trap`
5. **Input system frozen** as a side effect — WindowServer deadlock halted all event routing

---

## Resolution

```bash
sudo killall -9 WindowServer
```

This forces a session restart, bypassing the deadlocked IPC. macOS relaunches WindowServer, Dock, Finder, and the full UI stack automatically.

---

## Recommendations

1. **Monitor Xcode LLDB server memory** — `lldb-rpc-server` should not exceed a few hundred MB. Kill it after debugging sessions via `pkill lldb-rpc-server`.
2. **Don't run VM + game + OBS + Firefox simultaneously** on this machine without headroom monitoring.
3. **Set a memory pressure alert** — consider a menu bar tool (e.g. iStatMenus) to alert when free RAM drops below 2GB.
4. **Stage Manager + memory pressure = dangerous** — Stage Manager's Spaces IPC is sensitive to WindowServer latency. Under extreme memory pressure, the deadlock seen here is a known failure mode.
5. **Quick diagnostic commands for next time:**
   ```bash
   # Check free RAM
   vm_stat | grep "Pages free"

   # Top processes by memory
   ps axo pid,pmem,rss,comm | sort -k2 -rn | head -15

   # Sample a frozen process
   sample $(pgrep -x Dock) 1

   # Nuclear option if UI is deadlocked
   sudo killall -9 WindowServer
   ```
