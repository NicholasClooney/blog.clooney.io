---
title: "Godot + .NET Internals: PCK Files, Dual Runtimes, and Why Decompiled C# Looks Terrible"
date: 2026-04-24
tags:
  - godot
  - dotnet
  - modding
  - project-spire
excerpt: |
  A practical mental model for Godot 4 C# games: the PCK is Godot's virtual filesystem, the DLL is what CoreCLR executes, and decompiled C# looks worse because IL reconstruction is lossy.
---

*A technical deep-dive for Slay the Spire 2 modders and Godot C# developers.*

## The Puzzle: Why Is C# in Two Places?

If you extract a Godot 4 C# game - like Slay the Spire 2 - you'll notice something odd: C# appears to live in *two* places simultaneously.

- `sts2.pck` - Godot's packed asset archive
- `sts2.dll` - a .NET assembly sitting next to the executable

It looks like duplication. It isn't. They serve two completely different consumers.

## What Each File Is For

### The `.pck` File

A `.pck` is Godot's proprietary virtual filesystem archive - essentially a zip of everything the engine needs: scenes, textures, audio, shaders, and yes, C# source files. When the game launches, Godot mounts the `.pck` and exposes its contents through its own virtual file path system (`res://`).

The C# files bundled here are stored for **Godot's own purposes** - tooling, the editor, and resource consistency. In a Godot 4 C# project, the original `.cs` source files are bundled in as-is.

### The `.dll` File

The `.dll` is a standard .NET assembly - compiled IL bytecode that the CoreCLR runtime loads and executes. It lives on disk next to the game executable because the .NET runtime finds assemblies via **normal OS filesystem paths**, not through Godot's virtual filesystem. It has no concept of `.pck` files.

### The Flow

```text
Source .cs files
      |
      v (Roslyn compiler)
sts2.dll  <--- CoreCLR loads this for execution
      |
      v (bundled into)
sts2.pck  <--- Godot mounts this as its virtual filesystem
```

Same assembly. Two consumers. Two locations.

## Two Runtimes, Side by Side

This is the part that trips people up. When you run a Godot 4 C# game, **two separate runtimes are operating simultaneously**.

### Godot Engine Runtime

Godot is responsible for:

- The scene tree, nodes, physics, and rendering
- Its own virtual filesystem, where `.pck` gets mounted
- Resource loading via `GD.Load<T>()` and `res://` paths
- The main game loop and signal system

### .NET Runtime (CoreCLR)

Microsoft's CoreCLR is responsible for:

- Actually executing compiled C# IL bytecode
- Garbage collection and memory management
- Assembly resolution and loading
- The type system and reflection

### How They Connect

Godot doesn't execute C# itself. Instead, it **embeds CoreCLR as a hosted runtime** - similar to how Unity embeds Mono or IL2CPP. Godot bootstraps CoreCLR on startup, and the two sides communicate through a native interop bridge called **GodotSharp**.

```text
Godot Engine
    |
    |-- starts up, mounts sts2.pck
    |
    |-- initializes CoreCLR as embedded host
    |       |
    |       `-- CoreCLR loads sts2.dll from disk
    |               `-- your C# code runs here
    |
    |-- calls into C# via GodotSharp bindings
    `-- C# calls back into Godot via the same bridge
```

Your C# mod code is executed by CoreCLR, but the objects you're manipulating - `Node`, `Resource`, `PackedScene` - are Godot-side objects accessed through the GodotSharp bridge. A crash in either runtime breaks everything.

## Why PCK-Extracted C# Looks So Much Cleaner

Here's something you'll notice immediately when modding: if you extract C# from the `.pck` using [gdre_tools](https://github.com/bruvzg/gdsdecomp), the code looks clean and readable. But if you decompile the `.dll` with ILSpy or dnSpy, you get something much uglier. Same game. Same code. Why?

### What the `.pck` Contains

When gdre_tools extracts C# from the `.pck`, it's recovering files that Godot itself stored there. In a Godot 4 C# project, **the original `.cs` source files are bundled into the `.pck` directly** - they haven't been through any transformation. What you get is close to, or literally, the original source.

### What the `.dll` Contains

The `.dll` contains compiled **IL bytecode**. The source has already been processed by the Roslyn compiler - and in a Release build, also by the optimizer:

```text
.cs source
    |
    v Roslyn compiler
IL bytecode + metadata
    |
    v Release optimizations
    |-- method inlining
    |-- dead code elimination
    `-- local variable merging
         |
         v
    stored in .dll
```

When you run that through a decompiler, it's doing **reverse engineering** - reconstructing C# from IL. That's an inherently lossy process:

| What's Lost | Result in Decompiled Output |
|---|---|
| Variable names | `local_0`, `V_3`, `b__4` |
| Comments | Gone entirely |
| Lambdas / closures | Expanded into generated classes (`<>c__DisplayClass`) |
| LINQ expressions | Unrolled into state machines |
| Async/await | Explicit state machine structs |
| Compiler hints | All made explicit and ugly |

### At a Glance

| | `.pck` extracted | `.dll` decompiled |
|---|---|---|
| Source | Original `.cs` bundled by Godot | IL -> reconstructed C# |
| Variable names | Real, as written | Lost or mangled |
| Comments | Present | Gone |
| Lambdas | Clean one-liners | Ugly generated classes |
| Async methods | Clean | Explicit state machines |
| Accuracy | Original source | Approximation |

## Practical Takeaway for Modders

The `.pck` is the **primary target** when reverse engineering a Godot C# game. gdre_tools will give you clean, readable, close-to-original source code directly from it.

The decompiled `.dll` is a **fallback** - useful when something isn't bundled in the `.pck`, or when you need to verify what's actually being executed at the IL level. But for general modding and understanding game logic, start with the `.pck` extraction every time.

## Tools Referenced

- **[gdre_tools / gdsdecomp](https://github.com/bruvzg/gdsdecomp)** - the correct tool for `.pck` extraction; supports Godot 3 & 4, recovers GDScript from compiled `.gdc` bytecode, and extracts C# source from `.pck`
- **ILSpy / dnSpy** - .NET decompilers for inspecting the `.dll` at the IL level
- **GodotSharp** - the native interop bridge between the Godot and .NET runtimes
