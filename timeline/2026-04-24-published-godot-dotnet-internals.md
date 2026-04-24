---
title: "note: Godot + .NET Internals"
date: "2026-04-24"
time: "21:33"
tags:
  - published
  - godot
  - dotnet
  - modding
  - project-spire
---

I published [Godot + .NET Internals: PCK Files, Dual Runtimes, and Why Decompiled C# Looks Terrible](/notes/godot-dotnet-internals-pck-files-dual-runtimes-and-decompiled-csharp/) as a note for Slay the Spire 2 modding work. The useful distinction is that Godot mounts the `.pck` for its own virtual filesystem while CoreCLR loads the `.dll` from disk, which also explains why source recovered from the `.pck` reads cleaner than reconstructed C# from a decompiler.
