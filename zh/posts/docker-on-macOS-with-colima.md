---
title: "不用 Docker Desktop，在 macOS 上运行 Docker：我的 Colima 使用经历"
date: 2025-10-02
tags:
  - docker
  - macos
  - cli
  - infra
  - devops
---

和许多从 Linux 或服务器环境转过来的开发者一样，我在 Mac 上配置 Docker 时也有些困惑。在 Linux 上，安装 Docker 后就能原生运行。macOS 则不同：没有 Linux 内核，也就没有原生 Docker Engine。这正是 Docker Desktop 和 Colima 这类工具的用武之地。

下面说说我学到的东西。

[[toc]]

---

## 安装 Docker：CLI 与 Docker Desktop

执行：

```bash
brew install docker
```

只会安装 **Docker CLI**（`docker` 命令）。单靠它无法在本地运行容器，因为 macOS 上没有运行 Docker Engine。只有在连接远程 Docker 主机时，它才派得上用场。

相比之下，执行：

```bash
brew install --cask docker
```

会安装 **Docker Desktop**，其中包括：

* 底层的一台 Linux 虚拟机
* 虚拟机中的 Docker Engine
* Docker CLI
* Docker Compose
* 用于管理容器的图形界面

它能在本地使用，但系统资源开销更大，而且对较大规模的组织有许可限制。

---

## Colima：更轻量的选择

我没有使用 Docker Desktop，而是安装了 **[Colima](https://github.com/abiosoft/colima)**：

```bash
brew install colima docker
```

它的工作方式是：

* `docker`（CLI）让我执行命令。
* `colima` 在后台启动一台轻量 Linux 虚拟机。
* 这台虚拟机运行 Docker Engine。
* CLI 会自动配置为与 Colima 通信。

这样我基本上获得了与 Docker Desktop 相同的功能，同时拥有：

* 更低的 CPU 和内存开销
* 开源工具
* 没有许可限制
* 以 CLI 为主的工作流

---

## 验证 Docker 是否正常工作

用 `colima start` 启动 Colima 后，可以用几个命令测试配置：

```bash
docker info
```

显示引擎的详细信息。能正常执行，就说明 Docker 已经在运行。

```bash
docker run --rm hello-world
```

<img
  alt= "Docker Hello World"
  src="/assets/images/posts/docker-colima/docker-hello-world.png"
/>

运行测试容器，并在结束后立即将其删除（`--rm` 参数）。

```bash
docker run -d -p 8080:80 nginx
```

在后台启动 Nginx 容器。访问 `http://localhost:8080` 就能看到欢迎页。

```bash
docker ps
```

列出正在运行的容器。

---

## 管理磁盘占用

Docker 拉取的镜像会占用空间。可以这样查看磁盘上的内容：

```bash
docker images
```

列出全部镜像。

```bash
docker system df
```

显示镜像、容器和卷占用了多少磁盘空间。

```bash
du -h -d 1 ~/.colima
```

查看 Mac 上 Colima 虚拟机磁盘的大小。

清理不再使用的内容：

```bash
docker system prune -a
```

---

## 要点

* **`brew install docker`** 只安装 CLI，无法单独在本地运行容器。
* **Docker Desktop** 功能完整，但比较重。
* **Colima** + **docker CLI** 是在 macOS 上运行容器的轻量方案。
* 经常查看 `docker system df` 和 `~/.colima`，控制磁盘占用。
* 对于不需要保留的临时容器，`--rm` 参数很方便。

---

👉 采用这套配置后，我不需要 Docker Desktop，也能在 macOS 上顺畅地运行 Docker。整个方案更精简、更透明，也更在我的掌控之中。
