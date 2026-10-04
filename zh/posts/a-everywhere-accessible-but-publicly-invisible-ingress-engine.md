---
title: 随处可达、对公网隐形的私有入口引擎
date: 2026-02-08
tags:
  - tailscale
  - docker
  - private-network
  - security
  - networking
  - infra
  - devops
---

大多数个人项目和家庭实验室服务不必公开，但需要能够访问。我想在任何地方，用自己的任何设备访问开发工具、内部面板和副业项目，而不用开放端口、暴露 IP，也不用担心互联网中的谁会偶然发现它们。

这篇文章介绍我如何用 Tailscale、Docker、Caddy 和 DNS 重写，构建一个随处可达、对公网隐形的入口引擎。最终是一套基于域名的私有环境，像一个小型云：有 HTTPS、整洁的主机名和反向代理，但只有我能访问，运行在自己的机器上，完全不暴露到公共互联网。

[[toc]]

---

继续之前，先回答那个显而易见的问题。

## 为什么不直接用 `tailscale serve`？

> 它不适合我不断扩展的需求。

我知道它，也在用。坦白说，它有点像魔法。

你可以运行：

```bash
tailscale serve --https=8080 http://localhost:8080
```

然后立刻从同一 tailnet 中的另一台设备，通过下面地址访问服务：

```
https://device.your-tailnet.ts.net:8080/
```

对于快速试验或一次性服务，这非常棒。

不过，把它当作主要方案，有几件事我不太喜欢：

1. 得记得运行命令
2. 得记住哪个端口对应哪个服务
3. [“每台设备只有一个域名，而且不能使用子域名。” Gabriel Garrido](https://garrido.io/notes/tailscale-nextdns-custom-domains/#:~:text=I%20only%20get%20one%20domain%20per%20device%20and%20I%20cannot%20use%20subdomains)

一旦不止一个服务，这就成了实际问题。

我运行着多个网站和工具，包括[简历项目](https://github.com/TheClooneyCollection/project-resume)、[博客](https://github.com/NicholasClooney/blog.clooney.io)，以及它的模板项目 [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder)。每个都有 `dev` 和 `prod` 版本。很快，我就得面对不断增加的端口、脑中的记账工作，以及一套只存在于自己脑海里的配置。

我真正想要的是一个系统。每项服务都拥有稳定、好读的地址，比如 `dev.resume.clooney.io`，直接输入浏览器就能访问。不用记命令，也不用记端口。

但这通常意味着把服务公开暴露出去，这也不是我乐意做的事。

正是这个取舍，推动我构建了一个私有入口引擎：只有自己的设备能访问，对公网不可见，同时又像真正的网站环境一样，拥有域名和 HTTPS。

## 一点背景：容器化

> 我也不想为每个服务都运行一个 Tailscale sidecar 容器。

这些个人项目大多是 Eleventy 网站。我喜欢开发它们、快速迭代，并在本地运行。最近，我把它们从直接运行在机器上，迁移到了 Docker 容器。隔离和一致性变好了，但访问方式也变得更重要。

当时有多条可行路径。我可以在主机开放端口，再在本地使用 `tailscale serve`；也可以在每个服务旁边运行 Tailscale sidecar 容器。这两种办法都有效，也都合理。

但我不想最后变成每项服务都配一套 Tailscale 实例或容器。在概念上，我想让一个节点向其余 tailnet 表示“通往这台机器上本地服务的网关”。一个入口，所有流量从同一个地方进入。

之后，一切都应该像普通内部基础设施那样运行：服务通过共享 Docker 网络互相通信，路由集中处理，各个应用完全不用知道 Tailscale 的存在。

## 灵感与方法

我很幸运地读到了 Gabriel Garrido 的这篇文章：  
[使用 Tailscale 和自定义域名运行私有服务](https://garrido.io/notes/tailscale-nextdns-custom-domains/)

至少在概念上，我的整体方案与他很相似：Tailscale 提供私有 VPN，Caddy 负责反向代理并通过域名提供商签发 HTTPS 证书，NextDNS 负责 DNS 重写。

主要区别在部署方式和实现细节。

我的环境里，一切都在 Docker 中运行。Tailscale 在 Docker 中，虽然只有一个实例；Caddy 在 Docker 中；所有服务都在 Docker 中。没错，真的是全部。

<img
  alt= "Dockhand 容器列表"
  src="/assets/images/posts/private-ingress/dockhand-containers.png"
/>

除此之外，通过让这些容器共享网络接口，我完全去掉了本地主机端口映射。主机没有暴露端口，也没有零散的尾巴。

为什么做到这个程度？因为我喜欢整洁。没有多余暴露面，没有不必要的连接，每个组件都有明确的角色和位置。

## 细节决定成败

进入实现之前先说明：这种模式并不绑定 Tailscale、Caddy 或 NextDNS，它们只是我的选择。任何一层都可以换成等价工具，包括私有网络、反向代理和 DNS 重写服务，整体架构仍然成立。

### 模板仓库

如果想复用这个模式，我发布了一个起始模板：  
[private-ingress-engine-template](https://github.com/TheClooneyCollection/private-ingress-engine-template)

其中包含本文使用的基础 Docker Compose 和 Caddy 配置，可以按自己的服务调整。

### 架构图

Private Ingress Engine 将 Caddy 和应用放在只允许 Tailscale 访问的边界之后。

<img
  alt= "私有入口架构图"
  src="/assets/images/posts/private-ingress/private-ingress-diagram.png"
/>

- Caddy 是私有服务的入口。
- Tailscale sidecar 在 Docker 主机上提供 tailnet 连接。
- Tailnet 客户端（100.64.0.0/10）可以通过。
- 公网／非 tailnet 客户端首先因 DNS 解析失败而被阻挡。
    - 普通公共 DNS 中没有私有重写，也没有对应路由。
- 如果公网客户端直接到达入口，Caddy 仍会以 403 Unauthorized 拒绝访问。
- 获准流量会被反向代理到内部服务：
    - `dockhand:3000`
    - `project-resume-dev:8080`
    - `project-resume-prod:8080`

结果是：主机名相同，但只有连接 tailnet 的用户能可靠访问服务。

#### 安全说明：

- Tailscale ACL：将入口可达范围限定在自己的用户、组和设备。
- 密钥轮换：注册节点时使用短期、一次性 Tailscale auth key；DNS API token 定期轮换，怀疑泄露时立即更换。
- Token 存储：秘密不要进入 git，只保留 `.env.template`，真实值在运行时由秘密管理器注入。我使用 1Password + `op run`。

### 前提条件

实施之前，请确保具备：

- 有管理员权限的 Tailscale tailnet，用于 DNS 设置、ACL 和 auth key
- 一个域名，以及支持 ACME DNS-01 的 DNS 提供商 API token，例如 Cloudflare
- 可创建 DNS 重写的 NextDNS 配置
- 主机上的 Docker + Docker Compose v2
- 运行时环境变量注入的秘密管理流程，例如 1Password `op run`

### 共享 Docker 网络接口

在这之前，我不知道 docker compose 文件可以拆成多份再组合，像这样启动整套服务：

```
docker compose -f compose.yml -f compose.edge.yml up
```

这很有用，因为我的服务都是公开仓库，而这种不映射主机端口、共享网络的方案只适用于我的环境。运行这些项目的其他人，不需要创建 `edge` 网络接口。

我可以保留使用默认网络和主机端口映射的 `compose.yml`，再用 `compose.edge.yml` 清空／重置端口映射，并把服务接到外部 `edge` 接口。

{% github "https://github.com/TheClooneyCollection/project-resume/blob/3b1ded58e78a81609c34796d92f78ce5be836565/compose.edge.yml" %}

### Tailscale 与 Caddy

Caddy 使用 `network_mode: service:tailscale`，意味着它与 `tailscale` 容器共享完全相同的网络命名空间：

{% github "https://github.com/TheClooneyCollection/private-ingress-engine-template/blob/4917ffe8dbbf5e9187471bc90fe89ba1bce6fc87/compose.yml#L24-L43" %}

因为 Caddy 不发布主机端口，而且位于 Tailscale 接口之后，所以不会直接在主机层把 `:80` / `:443` 暴露给本地局域网或公网。

### Caddy

这里让入口行为变得明确、可预测。Caddy 同时做三件事：为 TLS 证明域名所有权，把主机名路由到容器，以及在边缘执行允许名单。

具体 Caddy 配置如下：

{% github "https://github.com/TheClooneyCollection/private-ingress-engine-template/blob/4917ffe8dbbf5e9187471bc90fe89ba1bce6fc87/conf/Caddyfile#L1-L40" %}

#### 域名提供商 API Token

Caddy 使用域名提供商 API token 完成 ACME DNS-01 验证，为私有主机名签发证书。Token 应遵循最小权限，并限定 DNS 区域范围。对于 Cloudflare，实用的最小权限是，仅针对这套入口管理的区域授予 `Zone:Read` + `DNS:Edit`。

#### 映射所有容器化服务

Caddyfile 中每个虚拟主机都清楚地映射到内部 Docker DNS 目标，例如 `dockhand:3000` 或 `project-resume-dev:8080`。因此可以保留友好域名（`dev.resume.<domain>`），而真实服务地址始终留在共享 Docker 网络内部。

#### 允许与拒绝

`remote_ip` 匹配器把访问策略直接写进 Web 配置。这意味着请求既要通过私有解析，又要来自获准的源地址范围。如果有请求从 tailnet 边界外到达入口，Caddy 会直接拒绝。

换句话说：DNS 重写让私有名称可用，Tailscale 提供私有路径，Caddy 则确保只接受这条私有路径。

### DNS 重写

这种模式有两个不错的私有 DNS 重写选择：`NextDNS + Tailscale DNS`，或 `Pi-hole + Tailscale DNS`。两种我都用过。个人更喜欢 Pi-hole，因为控制力更强，也更符合自托管、私有化的理念。但要保持重写稳定，Pi-hole 应运行在始终在线的基础设施上，例如家用服务器或 VPS。

#### 方案 1：NextDNS + Tailscale DNS

这是最容易的托管方案。在 NextDNS 设置重写，例如将 `dev.resume.clooney.io` 映射到入口节点的 Tailscale IP，再让 Tailscale DNS 设置把解析器配置应用到所有设备。

具体例子：

`dev.resume.clooney.io` -> `100.64.12.34`（`private-ingress-engine` 节点的示例 Tailscale IP）

<img
  alt="NextDNS 中的 DNS 重写"
  src="/assets/images/posts/private-ingress/nextdns-rewrites.png"
/>

#### 方案 2：Pi-hole + Tailscale DNS

如果想自托管 DNS 重写，模板现在包含了 Pi-hole 服务示例：

{% github "https://github.com/TheClooneyCollection/private-ingress-engine-template/blob/4917ffe8dbbf5e9187471bc90fe89ba1bce6fc87/compose.yml#L45-L60" %}

这个方案中，Pi-hole 处理本地重写规则，Tailscale 让 tailnet 内各设备的解析行为保持一致。

快速排障清单：

- 确认重写规则存在，并指向当前 Tailscale IP。
- 确认设备使用的是预期的 Tailscale DNS 设置。
- 修改重写后，刷新客户端设备／浏览器的 DNS 缓存。
- 查看 `tailscale status`，确认入口节点在线。
- 在 tailnet 客户端运行 `dig dev.resume.clooney.io`，应返回私有 `100.x.x.x` 目标。
- 如果 TLS 失败，检查 `CF_DNS_API_TOKEN`、区域权限和 Caddy 日志。

## 常见问题

### Tailscale

**问：Tailscale 的 auth key 与 OAuth 客户端／token，该用哪个？**  
答：节点只需加入 tailnet 时，用 auth key，单台机器或容器通常属于这种情况。构建调用 Tailscale API 的自动化时，用 OAuth。两者解决不同问题：节点注册与 API 访问。

**问：auth key 能设置为一天过期吗？**  
答：可以。可以创建包括一天有效期在内的短期 auth key，让注册更安全。

**问：Tailscale auth key 是一次性的吗？**  
答：可以设为一次性，这类配置通常也推荐如此。设备成功认证后，一次性 auth key 就被消耗，并自动失效，不能再注册其他设备。

**问：这里为什么不用可重复使用的 auth key？**  
答：这里只需认证一个入口容器，可重复使用的密钥增加风险，却没有额外价值。一次性密钥符合需求，即使泄露也能尽量缩小影响范围。

**问：auth key 过期与节点密钥／token 过期一样吗？它过期后，机器会被踢出去吗？**  
答：不一样，它们有不同的生命周期。auth key 过期只影响使用该密钥进行的*新登录／注册*。已认证机器会继续工作，并正常轮换自己的节点密钥，不会仅因最初的 auth key 过期而被踢出。

**问：入口节点应该设为临时节点吗？**  
答：这套配置不应该。临时节点用于短期工作负载，断开后会自动移除。稳定入口应使用普通的非临时节点，让它一直留在 Tailscale 设备列表中，并保持一致身份。

**问：重建 Tailscale 容器会发生什么？会坏吗？**  
答：只要在主机持久化 Tailscale 状态，就不会。这套配置把状态保存在容器文件系统之外，因此重建后节点身份仍在。

### Docker / Compose

**问：为什么拆分 compose 文件，而不是一个大文件？**  
答：这样对所有人开放的默认配置可以保持整洁，而自己的私有覆盖文件（`compose.shared-network.yml`）可以移除主机端口映射，并把服务接入私有边缘模式。

**问：为什么不做主机端口映射？**  
答：减少主机暴露面，让所有访问都经过 Tailscale + Caddy 这条受控入口。

### Caddy

**问：Tailscale 已经能访问，为什么还要 Caddy？**  
答：Caddy 为多项服务提供稳定主机名、集中路由和自动 HTTPS，不用逐个管理命令和端口。

**问：这套配置中，Caddy 代理到哪里？**  
答：通过共享网络，代理到内部 Docker DNS 名称，例如 `resume-dev:8080`。

**问：重建 Caddy 容器会怎样？**  
答：路由配置很容易从文件恢复，但 Caddy 仍需要 DNS 提供商 API token 来管理证书。确保通过环境变量／秘密配置重新提供 token。

**问：DNS API token 应多久轮换一次？**  
答：定期轮换，任何可能泄露后立即更换。实用基线是每 60 到 90 天一次，凭据暴露时紧急轮换。

**问：Caddy 最少需要哪些 DNS API token 权限？**  
答：只授予在所用特定区域中更新 DNS 验证记录所需的最小权限。避免账户级或无关权限；通常应选择限定区域的 DNS 记录读写权限。

### DNS 重写

**问：这里为什么使用 DNS 重写？**  
答：它让你输入人类易读的域名，同时仍解析到 tailnet 可达的私有目标。

**问：为什么把 DNS 重写与 Tailscale DNS 结合？**  
答：Tailscale 可以向 tailnet 设备分发 DNS 设置，NextDNS 或 Pi-hole 提供自定义重写行为，让每台设备都获得相同的私有命名体验。

## 接下来想改进什么

- 已完成！*“用自托管方案（Pi-hole 或 CoreDNS）替代托管 DNS 重写，减少外部依赖，让更多组件留在本地。”*

- 提升各套 Eleventy 服务的资源效率，尤其降低常驻 dev/prod 容器的稳态内存占用。

## 最后的想法

这套配置给了我想要的东西：私有服务拥有真正生产入口栈的体验，却不公开暴露。我仍有整洁域名、HTTPS 和集中路由，而访问范围始终限定在 tailnet 和自己的设备内。

更重要的是，它能随我的工作方式扩展。新增服务，只需在 Caddy 中映射一次，就能让各环境保持一致，不必记端口或执行一次性命令。

如果你公开构建项目，却私下运行基础设施，这种模式是实用的中间方案：云一般的使用体验、自托管的控制权，以及更小的攻击面。
