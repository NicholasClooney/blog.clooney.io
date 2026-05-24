---
title: "feature: ghostty-theme-picker v0.2.0"
date: "2026-05-24"
time: "18:18"
tags:
  - shipped
  - ghostty-theme-picker
  - ghostty
  - terminal
  - python
  - themes
---

I shipped [v0.2.0](https://github.com/NicholasClooney/ghostty-theme-picker/releases/tag/v0.2.0) of [ghostty-theme-picker](https://github.com/NicholasClooney/ghostty-theme-picker), a two-column TUI theme browser for Ghostty that lets me compare dark and light themes side by side, star favorites, and keep jump history while I browse. The new release adds forward history and persistent browse state, but the engineering bit I especially like is leaning on a functional core and imperative shell, so most of the state transitions stay pure and surprisingly testable even though the app lives in the terminal. I also recorded a short demo below so I have a visual snapshot of how it feels in motion.

<div style="position:relative;padding-bottom:69%;height:0;overflow:hidden;">
  <iframe
    src="https://www.youtube.com/embed/nwjMTlvUArk"
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>
