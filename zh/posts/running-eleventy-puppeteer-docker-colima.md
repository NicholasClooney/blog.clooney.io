---
title: "在 macOS 的 Docker（Colima）中运行 Eleventy 和 Puppeteer：完整折腾记录"
date: 2026-02-06
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

我想为自己的 Eleventy 简历项目配一套 Docker 环境，同时用 Puppeteer 生成 PDF。我以为这会很简单。**结果并不是。**

下面是从**零**到**可用**的真实过程，包括一路遇到的报错，以及每个报错到底意味着什么。

[[toc]]

---

## 1）从简单的开始：“放进 Docker 跑就行”

我先用标准 Node 镜像写了一个基础 Compose 文件：

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

macOS 上的热重载不太可靠，所以我加了轮询：

```yaml
environment:
  - CHOKIDAR_USEPOLLING=1
  - CHOKIDAR_INTERVAL=200
```

这让 Eleventy 开发服务器跑起来了，但我禁用了 PDF 生成，暂时不想处理在 Docker 中使用 Puppeteer 的麻烦。

---

## 2）第一个想法：在 Docker 中禁用 PDF

我添加了 `DISABLE_PDF` 开关，让 Eleventy 在开启时跳过 PDF 生成。这样 Docker 开发环境既快又稳定。

Eleventy 配置中：

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

然后：

```yaml
environment:
  - DISABLE_PDF=1
```

这样就有了一套“不生成 PDF”的 Docker 工作流。

---

## 3）接下来：试试 Puppeteer 官方镜像

官方镜像听起来很合适：

```
ghcr.io/puppeteer/puppeteer:latest
```

于是我改了 Compose 文件，用上这个镜像，结果马上遇到另一类问题。

### 问题 1：amd64 与 arm64

Colima 运行在 arm64 上，而 Puppeteer 的镜像是 amd64。

报错：

```
The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8)
```

修复：

```yaml
platform: linux/amd64
```

这次能跑了，但因为是在模拟 x86，所以更慢。

### 问题 2：node_modules 上的 `EACCES`

Puppeteer 镜像以非 root 用户运行，而我的命名卷 `node_modules` 属于 root。

报错：

```
EACCES: permission denied, mkdir '/app/node_modules/@11ty'
```

可选的修复方法：

- 重新创建卷（`docker compose down -v`）。
- 或者以 root 运行：

  ```yaml
  user: root
  ```

两种方法我都试过，最终是用 root 的临时办法解除了阻塞。

---

## 4）换条路：自己构建镜像（bookworm + chromium）

我放弃 Puppeteer 镜像，从 Debian slim 开始自己构建：

```dockerfile
FROM node:25-bookworm-slim

RUN apt-get update \
  && apt-get install -y chromium \
  && rm -rf /var/lib/apt/lists/*
```

这样装好了 Chromium，`which chromium` 返回 `/usr/bin/chromium`。

然后我加入应用配置和非 root 用户：

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

在 Compose 中添加 `build: .`，改用自己的 `Dockerfile`。

---

## 5）Chromium 仍然崩溃（命名空间错误）

即使用了非 root 用户和 `--no-sandbox`，Chromium 仍然启动失败：

```
Failed to move to new namespace: Operation not permitted
Check failed: . : Operation not permitted
```

原因是 Docker 默认的 seccomp 配置阻止了 Chromium 使用命名空间。需要满足以下一项：

- `SYS_ADMIN`；或者
- 更宽松的 seccomp 配置。

修复：

```yaml
cap_add:
  - SYS_ADMIN
```

这终于让 Chromium 在 Docker + Colima 下可靠地启动了。

---

## 6）最终可用的配置

让它稳定下来的关键点：

1. Debian slim 基础镜像。
2. 安装系统 Chromium。
3. `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`。
4. `--no-sandbox` 参数。
5. `cap_add: SYS_ADMIN`。
6. 用文件轮询实现热重载。
7. 用命名卷隔离每个服务的 `_site` 输出。

相关文件在这里：

- [Dockerfile](https://github.com/TheClooneyCollection/project-resume/blob/b1682b0acd9a98862a0de9f6d159c3fd5ec86114/Dockerfile)
- [docker-compose.yaml](https://github.com/TheClooneyCollection/project-resume/blob/b1682b0acd9a98862a0de9f6d159c3fd5ec86114/docker-compose.yaml)

---

## 收获

1. 如果你用 arm64，**Puppeteer 镜像并不是即插即用**。
2. **Chrome 虽然装好了，但不明确指定，Puppeteer 就不会使用它。**
3. **macOS + Colima** 会增加一些麻烦，例如 arm64 和文件监听问题。
4. 如果你需要可靠性，就基于 Debian **自己构建镜像**。
5. Docker 中的 Chromium **经常需要 SYS_ADMIN + no-sandbox**。
