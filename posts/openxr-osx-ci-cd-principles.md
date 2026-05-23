---
title: "Designing CI/CD for OpenXR-OSX"
date: 2026-05-23
tags:
  - ci
  - cd
  - openxr
  - macos
  - github-actions
  - mise
  - workflow
excerpt: |
  The CI/CD principles I want for OpenXR-OSX: binary-first onboarding, visible trust signals, lightweight default PR checks, required heavy runtime verification when the runtime changes, and local scripts that mirror CI exactly.
---

This post captures the principles I want to use for the `OpenXR-OSX` repo before turning them into actual `docs/`, `mise`, and `GitHub Actions` changes.

[[toc]]

## Why this matters

`OpenXR-OSX` is now in an awkward middle stage where it is more capable than the current docs make it sound, but less polished than a normal end-user release workflow.

The project already ships release assets like:

- a runtime zip
- a `Quest` APK
- a macOS companion app zip
- a simulator zip

That is enough to make the project meaningfully easier to try than a source-build-only setup. The problem is that the docs still read primarily like a contributor build guide, and the trust story still depends too much on local knowledge.

## The principles

### 1. Binary-first use should be obvious

If the project already publishes binaries, the repo should not behave like source builds are the only serious path.

That means:

- the release assets should be explained clearly
- the install order should be documented
- a normal user should be able to answer “what do I download?” without reading the whole repo

This is mostly a documentation and packaging problem, not a technical impossibility problem.

### 2. Trust should be visible in public CI

If a repo publishes runtime binaries and asks people to install them, the build and test story should be visible.

That means:

- public `GitHub Actions` workflows
- clear build/test artifacts
- release automation instead of an opaque manual release process when possible

The point is not perfection. The point is to move the repo from “someone built and uploaded this somehow” toward “I can see how this was produced.”

### 3. Cheap checks should run on every PR

If a check is inexpensive or cacheable, it should run all the time.

For this repo, that means the default PR lane should include:

- commit linting
- Android client build
- macOS companion app build
- simulator app build
- optionally the visionOS app build if it stays cheap enough to justify

These checks catch obvious breakage without paying the full cost of runtime-specific host setup on every single change.

### 4. Heavy runtime verification should be mandatory when the runtime changes

The expensive part of this repo is the real runtime verification lane:

- `cmake`
- `ninja`
- Metal Toolchain
- Vulkan loader and headers
- the actual runtime build
- `ctest`

That lane should not be optional when a PR touches runtime-sensitive files.

The important point is that this should be driven by path-based policy, not by whether a human remembered to add a label. A label can still be useful for communication, but correctness should not depend on it.

### 5. CI commands should always have local script equivalents

This one matters to me more than the average repo remembers.

Every CI job should be backed by a repo-local script that I can run myself.

That means:

- the workflow YAML should stay thin
- the real build logic should live in scripts
- a contributor should be able to reproduce CI quickly without reverse-engineering the workflow file

The scripts become the contract. CI just calls them.

### 6. Portable tools should be pinned in the repo

For this repo, `mise` is a good fit for the portable toolchain:

- `java`
- `android-sdk`
- `cmake`
- `ninja`
- `adb`

That gives contributors and CI a shared versioned tool surface instead of a drifting “install whatever is on your machine” model.

### 7. Host-specific macOS dependencies should stay explicit

Not everything here fits cleanly into a repo-local version manager.

For `OpenXR-OSX`, these are still host concerns:

- full `Xcode`
- the Metal Toolchain component downloaded by `xcodebuild`
- Vulkan loader and headers on `macOS`

Pretending those are fully portable would make the docs look cleaner, but it would make the setup story less honest.

So the rule is:

- pin the portable things with `mise`
- document the host dependencies directly

## The constraints

### Metal Toolchain is heavy

On my machine, the Metal Toolchain download was about `704.6 MB`.

That is not small enough to treat casually in CI. It is a real cost, which is one reason I do not want the heavy runtime lane to run for every trivial docs or UI PR.

Update: Well, actually... GitHub Actions' macOS images seem to have the Metal Toolchain built into it but still the build takes 3 minutes without any cache and 2 minutes with cache. So, I have decided to not always run this build.

### The runtime build depends on host-level graphics setup

This is not a pure portable C++ project.

The runtime lane depends on:

- Apple tooling
- Metal
- Vulkan headers/loader on `macOS`

That makes CI more expensive and also makes “works locally” more environment-sensitive than an ordinary library repo.

### Release trust and release speed pull in different directions

The more often a heavy release-capable lane runs, the slower and more expensive CI becomes.

The less often it runs, the weaker the public trust signal becomes.

So the balance I want is:

- cheap, useful checks on every PR
- heavy runtime verification when the runtime actually changes
- full packaging only on release flow

## How this applies to `OpenXR-OSX`

This repo has a very specific shape that drives the CI/CD design.

### The repo is cross-platform, but not uniformly expensive

There are really three categories of work:

1. `Quest` / Android client work
2. Apple app work like the companion app and simulator
3. core runtime work that depends on Metal and Vulkan-sensitive host setup

Those should not all pay the same CI cost by default.

### The runtime lane is the expensive truth lane

The runtime is where the project’s credibility really lives.

If:

- `runtime/**`
- `tests/**`
- `cmake/**`
- `CMakeLists.txt`
- the shared protocol header
- or the install/build docs that define runtime prerequisites

change, then the full macOS runtime build and test lane must run and pass.

That is the heavy lane, and it is worth keeping expensive because it is the lane that answers “does the actual runtime still build and pass its tests?”

### The release story is already half there

This is the part I think is easy to miss.

The author is already shipping release assets. The repo is not starting from zero. What is missing is:

- clearer release-oriented docs
- public CI around those outputs
- a more automated release pipeline

That means the work is less “invent a distribution model” and more “make the current distribution model explicit, reproducible, and easier to trust.”

## What I want to implement

### Tooling

- a `mise.toml` for portable tools
- scripts for local CI reproduction

Likely script layout:

- `scripts/ci/commitlint.sh`
- `scripts/ci/android-build.sh`
- `scripts/ci/companion-build.sh`
- `scripts/ci/simulator-build.sh`
- `scripts/ci/visionos-build.sh`
- `scripts/ci/macos-runtime-verify.sh`
- maybe a `scripts/ci/bootstrap-macos-host.sh` for host dependencies

### Documentation

- a release-first quick start
- clearer install docs that prefer `mise` for portable tools
- explicit macOS host prerequisites
- local script entrypoints for reproducing CI

### PR CI

Always on:

- commit linting
- Android client build
- companion app build
- simulator build
- maybe visionOS build

Required for runtime-sensitive changes:

- full macOS runtime configure/build/test

### Release automation

- conventional commits
- automated semver versioning
- release PRs and changelog generation
- automated packaging/publishing of release assets

For this repo, I lean toward `release-please` because it keeps the release flow easier to reason about in a GitHub-native repo.

## How I am balancing those things

The balancing rule is simple:

- run cheap things always
- run expensive things when correctness demands them
- keep release packaging separate from ordinary PR verification
- make every CI path reproducible locally

That keeps the repo honest without making every contribution feel like it has to pay the cost of a release build.

## Bottom line

The CI/CD design I want for `OpenXR-OSX` is not “maximum automation everywhere.”

It is:

- binary-first for users
- visible CI for trust
- `mise` for portable tool reproducibility
- explicit handling of unavoidable macOS host dependencies
- mandatory heavy runtime verification when runtime-sensitive code changes
- local scripts that mirror CI exactly
- release automation that produces the same assets the project is already trying to ship

That feels like the right middle ground between a personal prototype repo and a polished platform project.
