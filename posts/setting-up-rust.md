---
title: "Setting Up Rust Securely (Without the Blind `curl | sh`)"
date: 2025-10-12
eleventyNavigation:
  key: setting-up-rust
tags:
  - rust
  - security
  - macos
  - cli
  - devops
---


## 1. Introduction

Rust is one of the most thoughtfully designed languages of our time — but setting it up on macOS can feel oddly opaque. The standard advice is to run a one-liner like `curl https://sh.rustup.rs | sh`, which works beautifully but hides a lot of what’s happening behind the scenes. For developers who are more security-conscious or just prefer to know what’s being installed and where, this default approach can feel like a black box.

This post explores the different ways to install and manage Rust on macOS — from the convenience of Homebrew to the flexibility of rustup, and the transparency of manual or containerized setups. The goal is simple: give you control and understanding without sacrificing practicality.

[[toc]]

---

## 2. TL;DR — Installation Methods Compared

| Method                                               | Pros                                               | Cons                                                | Best For                                        |
| ---------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| **Homebrew (`brew install rust`)**                   | Managed by system package manager, simple          | Single version only, slower updates                 | Users who just need stable Rust globally        |
| **rustup (official script)**                         | Multi-toolchain, per-project pinning, reproducible | Involves piping a script to shell                   | Most Rust developers; convenience with trust    |
| **rustup via Homebrew (`brew install rustup-init`)** | Same power as rustup but auditable via Brew        | Slightly more manual setup                          | Balanced approach: flexibility + safety         |
| **Manual install**                                   | Full transparency, verifiable signatures           | Complex, more maintenance                           | Power users or high-security environments       |
| **Docker / Vagrant**                                 | Fully isolated, reproducible environments          | Slower I/O on macOS, can’t build macOS/iOS binaries | Reproducible Linux builds or CI-like dev setups |

If you’re unsure: **use `brew install rustup-init`** — it gives you the full power of rustup while keeping installation auditable through Homebrew.

---

## 3. The Typical Rust Installation Path

Running:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

downloads the official rustup installer and executes it in your shell. The script detects your platform, downloads a precompiled `rustup-init` binary, and installs it to `~/.cargo/bin`, along with the default toolchain (usually `stable-x86_64-apple-darwin`).

This is the official and supported way — the Rust team maintains the infrastructure, uses HTTPS, and distributes signed manifests. However, you don’t see what’s happening under the hood, and for some, that’s reason enough to pause.

---

## 4. The Brew Alternative

Installing Rust via Homebrew is simple:

```bash
brew install rust
```

Homebrew handles the download, checksum verification, and installation into `/usr/local/Cellar/rust` (or `/opt/homebrew` on Apple Silicon). You get `rustc`, `cargo`, and standard tools, all linked into `/usr/local/bin`.

**Pros:** managed updates, clear ownership, integrates with system package management.

**Cons:** one version only, updates lag behind official releases, and you can’t easily install nightly or beta toolchains. If you use multiple Rust projects that depend on different versions, this can get painful quickly.

---

## 5. My Preferred Way

If you dislike running a shell script from the web, but also want to have all the convenience of managed versions, components, targets etc...

Install `rustup` via Homebrew directly:

```bash
brew install rustup
```

This installs the same tool but through a trusted, auditable channel.

### Understanding rustup Deeply

`rustup` isn’t the compiler — it’s a *toolchain manager*. It manages versions, components, and targets under `~/.rustup`, while the compilers and tools themselves live under `~/.cargo/bin`.

With rustup, you can:

```bash
rustup install stable
```

It installs cargo, clippy, rust-docs, rust-std, rustc, rustfmt, and sets default toolchain to 'stable-aarch64-apple-darwin'.

You can even pin versions per project via `rust-toolchain.toml` or `rustup override set`. Updates (`rustup update`) fetch signed manifests from Rust’s CDN. It’s safe and reproducible.

---

## 6. Containerized Rust: Docker & Vagrant

If you want complete isolation from your host system, Rust runs well inside Docker or Vagrant-managed containers:

```bash
docker run --rm -it \
  -v "$PWD":/workspace \
  -w /workspace rust:1-bookworm bash
```

You can build projects, cache dependencies in named volumes, and keep your host system clean.

**Pros:** clean reproducibility, no system pollution, easy CI parity.

**Cons:** macOS filesystem performance under Docker can be slow, and you can’t cross-compile macOS/iOS binaries from Linux containers.

If you want extra reproducibility, Vagrant can wrap Docker for defined dev boxes — though that’s often overkill unless you’re building a large multi-developer setup.

---

## 7. Security & Trust Considerations

Ultimately, installing Rust is about **who you trust**:

* **Homebrew:** trusts Homebrew maintainers and their bottles.
* **rustup:** trusts Rust project’s official distribution infrastructure.
* **Docker:** trusts the Rust Docker image maintainers, depends on which one you choose.

For extra peace of mind:

* Install `rustup` via Brew, not via `curl | sh`.
* Use a non-root user inside Docker containers.
* Verify signatures when downloading manually.
* Audit your dependencies with [`cargo-vet`](https://github.com/mozilla/cargo-vet) or [`cargo-crev`](https://github.com/crev-dev/cargo-crev).

---

## 8. Practical Recommendations


- **If you want simplicity:** `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **If you want control & convenience:** `brew install rustup`.
- **If you want isolation:** Docker with named cargo volumes.


A good middle ground for most macOS developers is:

```bash
brew install rustup
rustup default stable
# Make sure to add the `rustup/bin` path to your shell's PATH env variable
```

This setup is auditable, reproducible, and works with all major tooling (VS Code, Rust Analyzer, etc.).

---

## 9. Closing Thoughts

Setting up Rust securely doesn’t have to mean sacrificing convenience. The key is **awareness** — understanding what’s installed, where it lives, and who you’re trusting.

Rust’s ecosystem is designed around reproducibility and safety, and that extends to its tooling. Whether you prefer a fully containerized setup, a manually verified binary, or just the standard rustup workflow, what matters is that you make an informed choice.

After all, security isn’t just about saying *no* to scripts — it’s about knowing exactly what they do.
