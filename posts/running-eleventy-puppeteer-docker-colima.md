---
title: "Running Eleventy + Puppeteer in Docker on macOS (Colima): The Full Journey"
date: 2026-02-06
eleventyNavigation:
  key: running-eleventy-puppeteer-docker-colima
tags:
  - docker
  - macos
  - colima
  - eleventy
  - puppeteer
  - pdf
  - chromium
  - devops
---

I wanted a Docker setup for my Eleventy resume project that also generates a PDF using Puppeteer. I assumed this would be straightforward. **It wasn’t.**

Here’s the real path, from **zero** to **working**, with the errors along the way and what each one actually meant.

[[toc]]

---

## 1) Start simple: “just run it in Docker”

I began with a basic compose file using a standard Node image:

```yaml
services:
  resume:
    image: node:25-alpine
    working_dir: /app
    volumes:
      - ./:/app:cached
    ports:
      - "127.0.0.1:8080:8080"
    command: >
      sh -lc "npm install && npm run dev"
```

Hot reload wasn’t reliable on macOS, so I added polling:

```yaml
environment:
  - CHOKIDAR_USEPOLLING=1
  - CHOKIDAR_INTERVAL=200
```

This got Eleventy dev server working, but I disabled the pdf generation so I didn't have to deal with the mess of using Puppeteer in Docker.

---

## 2) First idea: disable PDF in Docker

I added a `DISABLE_PDF` flag and taught Eleventy to skip PDF generation when it’s on. That kept Docker dev fast and reliable.

In Eleventy config:

```js
const disablePdf = process.env.DISABLE_PDF === "1" || process.env.DISABLE_PDF === "true";

eleventyConfig.on("eleventy.after", () => {
  if (disablePdf) return Promise.resolve();
  return new Promise((resolve, reject) => {
    exec("node scripts/generate-pdf.js", (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});
```

Then:

```yaml
environment:
  - DISABLE_PDF=1
```

That gave me a “no-PDF” Docker workflow.

---

## 3) Next: try the official Puppeteer image

The official image sounded perfect:

```
ghcr.io/puppeteer/puppeteer:latest
```

So I swapped my compose file to use it. That immediately raised a different class of problems.

### Issue 1: amd64 vs arm64

Colima runs on arm64. Puppeteer’s image is amd64.

Error:
```
The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)
```

Fix:
```yaml
platform: linux/amd64
```

It ran — but slower, since it’s emulating x86.

### Issue 2: `EACCES` on node_modules

Puppeteer image runs as a non-root user, while my named `node_modules` volume had root ownership.

Error:
```
EACCES: permission denied, mkdir '/app/node_modules/@11ty'
```

Fix options:
- Recreate the volume (`docker compose down -v`)
- Or run as root:
  ```yaml
  user: root
  ```

I tried both but using the root workaround finally unblocked me.

---

## 4) Pivot: build our own image (bookworm + chromium)

I gave up on the Puppeteer image and built from scratch using Debian slim:

```dockerfile
FROM node:25-bookworm-slim

RUN apt-get update \
  && apt-get install -y chromium \
  && rm -rf /var/lib/apt/lists/*
```

That installed Chromium, and `which chromium` returned `/usr/bin/chromium`.

I then added app setup + non-root user:

```dockerfile
WORKDIR /app
COPY package*.json ./
ENV PUPPETEER_SKIP_DOWNLOAD=1
RUN npm install
COPY . .

RUN useradd -m -u 1001 puppeteer \
  && chown -R puppeteer:puppeteer /app
USER puppeteer

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

Compose was updated to use our own `Dockerfile` by adding `build: .`.

---

## 5) Chromium still crashed (namespace error)

Even with non-root and `--no-sandbox`, Chromium still failed:

```
Failed to move to new namespace: Operation not permitted
Check failed: . : Operation not permitted
```

This is Docker’s default seccomp profile blocking Chromium namespace usage. It requires either:

- `SYS_ADMIN`, or
- a more permissive seccomp profile.

Fix:

```yaml
cap_add:
  - SYS_ADMIN
```

That finally got Chromium to launch reliably under Docker + Colima.

---

## 6) Final working setup

Key points that made it stable:

1. Debian slim base image
2. System Chromium installed
3. `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`
4. `--no-sandbox` args
5. `cap_add: SYS_ADMIN`
6. File polling for hot reload
7. `_site` output isolated per service with named volumes

You can see the files here:

- [Dockerfile](https://github.com/TheClooneyCollection/project-resume/blob/b1682b0acd9a98862a0de9f6d159c3fd5ec86114/Dockerfile)
- [docker-compose.yaml](https://github.com/TheClooneyCollection/project-resume/blob/b1682b0acd9a98862a0de9f6d159c3fd5ec86114/docker-compose.yaml)

---

## Takeaways

1. **The Puppeteer image isn’t plug-and-play** if you’re on arm64.
2. **Chrome exists, but Puppeteer doesn’t use it unless you tell it.**
3. **macOS + Colima** adds more friction (arm64, file watch issues).
4. If you need reliability, **build your own image** on Debian.
5. Chromium in Docker **often needs SYS_ADMIN + no-sandbox**.
