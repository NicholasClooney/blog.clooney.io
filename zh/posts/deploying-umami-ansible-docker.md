---
title: "用 Umami、Docker Compose 和 Ansible 搭建私有分析系统"
date: 2025-11-03
tags:
  - umami
  - docker
  - devops
  - infra
  - tailscale
  - private-network
  - security
social:
  reddit:
    status: shared
    lastShared: 2025-12-12T14:38:50.838Z
  mastodon:
    status: shared
    lastShared: 2025-11-04T11:29:28.032Z
  linkedin-post:
    status: shared
    lastShared: 2025-11-04T11:23:59.195Z
---

我想给博客加上第一方访问分析，又不想把流量数据交给 SaaS 厂商。Umami 完全符合需求：开源、可自托管、尊重隐私。我本来就有一台全天在线的小型 VPS，分出一点资源给 Umami，感觉正合适。

[[toc]]

---

## 为什么是 Umami，为什么是现在

关掉常见的追踪器后，访问分析就成了盲区。我需要一个这样的方案：

- **自托管**，让数据始终留在自己的基础设施内。
- **足够轻量**，能和其他服务一起运行在同一台机器上。
- **适合我的工作流**，最好像其他服务一样由 Ansible 管理。

Umami 是一个简单的 Node 应用，数据存储在 Postgres 中。官方文档让本地或云端运行都很容易，但我想要的是一套可重复、适合生产环境的配置，能先在 Mac 上测试，再一口气通过 Ansible 部署。

---

## 简单认识 Umami

如果你还没接触过，[Umami](https://umami.is/) 是一个开源分析平台，提供类似 Google Analytics 的基础功能，但没有那些臃肿的部分。它是一个以 Postgres 为后端的 Node 应用，给网站提供一小段 `<script>`，再通过漂亮的仪表盘查看数据。没有第三方 Cookie，没有隐藏追踪器，就是一个直截了当了解访客的工具。

---

## 我考虑过的部署方式

部署 Umami 有三种显而易见的方式：

1. 在服务器上直接安装 Node、pnpm 和 PM2。
2. 用一个 Docker 容器运行应用，单独管理 Postgres。
3. 用 Docker Compose 定义这两个服务及其关系。

第三个方案立刻胜出。Compose 带来：

- **本地环境一致。** 我可以用 Colima 在 macOS 上启动整套服务，就像[这篇在 macOS 上使用 Docker 的文章](/zh/posts/docker-on-macOS-with-colima/)里一样。
- **可复现的组合。** compose 文件描述确切的镜像、健康检查和所需卷，非常适合基础设施即代码。
- **不污染宿主机。** VPS 保持为干净的 Docker 主机，不会残留 Node/npm/PM2 软件包。
- **明确的依赖关系。** Compose 编排 Postgres + Umami，等待数据库健康检查通过后再启动应用。
- **严格的网络边界。** 服务通过私有桥接网络通信，只有我发布的端口才会暴露到宿主机。
- **适合 Ansible 自动化。** Ansible 可以在同一个 role 中放置 compose 文件、渲染 `.env`，并运行 `docker compose up -d`。

---

## 核心 Ansible Role

我把所有东西封装在 [`ansible-role-umami`](https://github.com/NicholasClooney/ansible-role-umami/tree/main) 中，以便跨机器复用。在提交 `f31f9b9a1c71039311a71ece3c8c8162de84316c` 中，compose 模板如下：

{% github "https://github.com/NicholasClooney/ansible-role-umami/blob/f31f9b9a1c71039311a71ece3c8c8162de84316c/templates/docker-compose.yml.j2#L11-L56" %}

几个重点：

- Postgres 使用命名卷持久化数据，并提供健康检查。
- Umami 等待健康检查通过后再启动。
- `ports` 指令绑定到 {% raw %}`{{ umami_bind_address }}`{% endraw %}，因此我可以将它限制在 `127.0.0.1`，而不是公开接口上。

默认值与模板放在一起，因此每次安装默认都只监听回环地址的 `3000` 端口，除非我主动覆盖：

{% github "https://github.com/NicholasClooney/ansible-role-umami/blob/f31f9b9a1c71039311a71ece3c8c8162de84316c/defaults/main.yml#L1-L27" %}

主任务文件把这些串起来。Ansible 在控制端生成强密钥，让它们在多次运行之间保持不变；渲染 `.env` 和 `docker-compose.yml`；然后通过社区模块执行 `docker compose up`：

{% github "https://github.com/NicholasClooney/ansible-role-umami/blob/f31f9b9a1c71039311a71ece3c8c8162de84316c/tasks/main.yml#L1-L72" %}

任一模板变化时，handler 只需重启整套服务，让升级行为保持可预测。

---

## 关于 Docker 与 UFW 的提醒

如果发布端口时没有留意，Docker 会悄悄绕过 UFW，因为它管理自己的 iptables 链。这意味着，即使服务器设置了“拒绝传入”，只要绑定到 `0.0.0.0`，仍可能把应用暴露给公网。

> 运行容器并发布端口时，例如 `-p 3000:3000`，Docker 会直接修改 iptables，而不是通过 ufw。  
> 这些规则先于 ufw 的用户空间规则被求值。  
> 所以，即使 ufw 已启用，一条简单的 `docker run -p 3000:3000 umami` 仍会在所有接口 `0.0.0.0` 上暴露 3000 端口。

在 compose 文件中绑定 `127.0.0.1`，可以让仪表盘保持完全私有，直到我在前面放上反向代理或 Tailscale。

---

## 将 Role 接入 Project Lighthouse

我的家庭实验室 playbook `ansible-project-lighthouse` 只需几行就能使用这个 role：

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/main.yml#L27-L36" %}

组变量把仪表盘限制在回环网络上，等待前面的反向代理接入：

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/group_vars/debian_lighthouse/main.yml.template#L12-L35" %}

因为我只信任 tailnet 内的设备访问敏感仪表盘，所以运行了一个很小的 systemd 单元，通过 [Tailscale Serve](/zh/posts/how-tailscale-revolutionized-my-mobile-workflow/) 发布 Umami：

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/roles/tailscale_serve/tasks/main.yml#L1-L19" %}

最终得到一个私有的 `https://umami.tailXX.ts.net` 端点，只有已登录的 tailnet 设备才能访问。没有公开入口，也不必猜测。

---

## 用 Nginx 发布追踪脚本

公网仍需要访问 `/script.js` 和 `/api/send`，因此我配置了一个 Nginx 站点，只暴露这两个端点，同时让完整仪表盘受允许列表保护：

{% github "https://github.com/NicholasClooney/ansible-project-lighthouse/blob/d86df08f03ffe5f5869a04d0e2c32e2d47fe2544/roles/umami_nginx/templates/analytics.conf.j2#L1-L68" %}

- `/script.js` 和 `/api/send` 直接代理到 Umami，并附上所需的 CORS 响应头。
- 其他路径先检查允许列表；生产环境中，我把它设为 tailnet 地址范围，这样只有我能看到界面。

有了这些配置，公开网站可以嵌入 Umami 的脚本标签，而管理界面对其他人仍然没有可达路由。

---

## 整套系统如何运行

组合起来，流程如下：

1. **Ansible** 渲染 `.env` + `docker-compose.yml`，生成密钥，运行 `docker compose up -d`。
2. **Docker Compose** 启动 Postgres + Umami，检查各项健康状态，并把界面绑定到回环地址。
3. **Tailscale Serve** 将仪表盘发布到我的 tailnet，让我随处都能查看分析，包括手机上。
4. **Nginx** 只把数据上报端点代理到公网，其余部分继续锁住。

这个 role 也能在本地运行，所以我可以克隆仓库、启动 Colima，先在 Mac 上测试完全相同的服务组合，再向上游推送改动。有更新时，`ansible-playbook main.yml --tags umami` 会拉取新镜像，干净地重启服务。

---

## 最后的想法

纸面上看起来复杂，但这套配置最终浓缩成一次可重复的 Ansible 运行：

- Compose 保持宿主机整洁，让部署可预测。
- Tailscale 和 Nginx 添加恰到好处的路由，维持默认私有。
- 密钥始终由我掌控，回滚只需一条 `docker compose down`。

如果你已经在用 Ansible 自动化服务器，可以拿去用这个 role，调整默认值，先在 Colima 沙箱中试一遍。准备上线时，把 playbook 指向服务器，就能私密地使用 Umami 仪表盘。之后也可以看看关于 [Colima](/zh/posts/docker-on-macOS-with-colima/)、[Tailscale](/zh/posts/how-tailscale-revolutionized-my-mobile-workflow/) 和[调试 Umami](/zh/posts/debugging-umami/)的相关文章，了解其他部分如何拼在一起。
