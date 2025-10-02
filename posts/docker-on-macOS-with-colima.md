---
title: "Running Docker on macOS Without Docker Desktop: My Journey With Colima"
date: 2025-10-02
eleventyNavigation:
  key: docker-on-macOS-with-colima
---

Like a lot of developers coming from Linux or a server environment, I hit some confusion when setting up Docker on my Mac. On Linux, you just install Docker and it works natively. On macOS, it’s a bit different — there’s no native Docker Engine because we don’t have a Linux kernel. That’s where tools like Docker Desktop and Colima come in.

Let me walk through what I’ve learned.

---

## Installing Docker: CLI vs. Docker Desktop

When you run:

```bash
brew install docker
```

you only get the **Docker CLI** (`docker` command). This by itself can’t run containers locally, because there’s no Docker Engine running on macOS. It’s only useful if you’re connecting to a remote Docker host.

By contrast, if you run:

```bash
brew install --cask docker
```

you install **Docker Desktop**, which includes:

* A Linux VM under the hood
* Docker Engine inside that VM
* Docker CLI
* Docker Compose
* A nice GUI for managing containers

This works locally, but it’s heavier on system resources and has licensing limitations for larger organizations.

---

## Colima: A Lighter Alternative

Instead of Docker Desktop, I installed **[Colima](https://github.com/abiosoft/colima)**:

```bash
brew install colima docker
```

Here’s what happens:

* `docker` (CLI) lets me run commands.
* `colima` launches a lightweight Linux VM behind the scenes.
* That VM runs the Docker Engine.
* The CLI is automatically wired to talk to Colima.

So effectively, I get the same functionality as Docker Desktop, but with:

* Less CPU/memory overhead
* Open-source tooling
* No licensing restrictions
* CLI-first workflow

---

## Verifying That Docker Works

Once Colima is started with `colima start`, I can test my setup with a few commands:

```bash
docker info
```

Shows details about the engine — if this works, Docker is live.

```bash
docker run --rm hello-world
```

<img
  alt= "Docker Hello World"
  src="/assets/docker-hello-world.png"
/>

Runs a test container and removes it immediately when finished (`--rm` flag).

```bash
docker run -d -p 8080:80 nginx
```

Starts an Nginx container in the background. Visiting `http://localhost:8080` shows the welcome page.

```bash
docker ps
```

Lists running containers.

---

## Managing Disk Usage

Docker pulls in images, and they take up space. To see what’s on disk:

```bash
docker images
```

Lists all images.

```bash
docker system df
```

Shows how much disk space images, containers, and volumes are using.

```bash
du -h -d 1 ~/.colima
```

Shows how big the Colima VM disk is on my Mac.

To clean up unused stuff:

```bash
docker system prune -a
```

---

## Key Takeaways

* **`brew install docker`** installs only the CLI — not enough to run containers locally.
* **Docker Desktop** is full-featured but heavy.
* **Colima** + **docker CLI** is a lightweight alternative for running containers on macOS.
* Always check `docker system df` and `~/.colima` to keep disk usage under control.
* The `--rm` flag is handy for temporary containers that don’t need to persist.

---

👉 With this setup, I now have Docker running smoothly on macOS without needing Docker Desktop. It feels more minimal, transparent, and under my control.