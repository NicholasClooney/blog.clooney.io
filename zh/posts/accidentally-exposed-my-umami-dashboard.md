---
title: "我如何意外把 Umami 仪表盘暴露在公网，以及学到的教训"
date: 2025-10-03
tags:
  - umami
  - docker
  - tailscale
  - private-network
  - security
  - infra
  - devops
---

最近，我在 VPS 上用 Docker 和 Nginx 配好 [Umami](https://umami.is/) 几小时后，发现一个配置错误把管理后台暴露到了公网。幸好没有立即造成危险。我在创建 Umami 的 Docker 实例后就马上修改了管理员用户名和密码，也在出事之前收紧了访问权限。不过，这仍然让我紧张了一阵：部署时的小失误，后果可能很大。

下面说说事情的经过，以及我从中学到的东西。

[[toc]]

---

## 配置错在哪里

我最初的 Umami Docker Compose 配置里有这样一段：

```yaml
ports:
  - "0.0.0.0:3000"
```

这会把容器发布到 **0.0.0.0:3000**，整个互联网都能访问。我以为防火墙 UFW 会挡住访问，后来才知道 Docker 会通过自己的 iptables 规则绕过 UFW。所以，尽管 UFW 显示 3000 端口已关闭，它实际上却敞开着。

我从外部测试时，发现 `http://myserverip:3000/dashboard` 可以直接从公网访问。

**糟了。**

---

## 修复

为了关闭公网访问，我把 Docker Compose 改成**只绑定 localhost**：

  ```yaml
  ports:
    - "127.0.0.1:3000:3000"
  ```

这样，Umami 就无法再从互联网访问，只有主机本身能访问它。

---

## 接着，Tailnet 访问也断了

我经常通过 Tailscale 访问仪表盘（`http://debian.tailXXXX.ts.net:3000/dashboard`），但这条路突然也不通了。为什么？

* Nginx 仍能访问 `127.0.0.1:3000`，因为它就在本机上。
* 但 tailnet 中的其他设备访问的是服务器的 Tailscale IP（`100.x.x.x:3000`），这个地址上没有服务在监听。

解决办法是 **Tailscale Serve**。

```bash
sudo tailscale serve --https=443 http://127.0.0.1:3000
```

这样就能通过 tailnet 私密地访问 `https://debian.tailXXXX.ts.net/dashboard` 上的 Umami，而不把它暴露到公网。

---

## 几个重要教训

### 1. Docker 端口与对外暴露

* `"0.0.0.0:3000"` 会向全世界开放，不受 UFW 的限制。
* 更安全的选择：
  * 只绑定 `127.0.0.1:3000`。
  * 或者完全省去 `ports:`，通过 Docker 网络连接。

### 2. 为什么 Nginx 能访问，Tailnet 却不行

* `127.0.0.1` 上的服务只允许本机访问。
* Nginx 在主机上运行，因此仍能访问 Umami。
* Tailscale 设备通过 `tailscale0`（100.x.x.x）连接，所以访问不了。

### 3. Tailscale Serve 与 Funnel

* `tailscale serve` **只在你的 tailnet 内**共享本地运行的服务。
* 它**不会**把服务暴露到公网。
* 只有主动启用 **Tailscale Funnel** 才会开放公网访问。

### 4. 最终的安全配置

* Umami 绑定到 `127.0.0.1:3000`。
* Nginx 只向公网代理 `/script.js` 和 `/api/{send,collect}`。
* 仪表盘只能通过 Tailscale Serve 访问。

---

## 结语

一次小小的配置失误，成了一堂很有价值的安全课。一定要用 `ss`、`docker ps` 或 `nmap` 核实实际暴露了什么，别想当然地以为防火墙会替你挡住一切。现在，我的 Umami 配置既更安全，也更清晰：公网端点只用于统计，仪表盘通过 Tailscale 私密访问。

如果你也在自托管服务，希望我的失误能给你提个醒：**不要相信假设，要相信验证。**
