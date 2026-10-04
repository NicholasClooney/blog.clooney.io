---
title: "在 iPhone 上用 AI 辅助编程：关于工具、自由与乐趣的一段旅程"
date: 2025-09-28
tags:
  - ai
  - ai-assisted
  - tailscale
  - tmux
  - cli
  - private-network
  - security
  - macos
---

## 引言

多年来，我总觉得写代码离不开书桌：面前摆着 Mac、完整键盘和完整 IDE。但最近我开始畅想：*如果能把整间创意编程工作室装进口袋呢？* 不只是 SSH 访问，而是真正由 AI 辅助的环境，让我随处写代码、提交改动、预览项目。

这篇博客一半是技术过程，一半是个人感想。它讲述了我如何探索 Cloudflare Tunnel、发现 Tailscale、用 tmux 和 iTerm 完善工作流，最终获得把一台完整 Mac 装进口袋的自由。

[[toc]]

---

## 最初的火花

在探索远程访问之前，我就已经在 iTerm 中使用三窗格工作流：左边主窗格用自然语言与 Codex 对话，右上角运行简写 Git 命令，右下角查看 Eleventy 服务日志。对于在 iPhone 这样的小屏幕上移动编程，这套布局**简直完美**！

它长这样：

<img
  alt= "我的 iTerm 布局"
  src="/assets/images/posts/iphone-ssh/my-iterm-setup.png"
/>

这套配置成了基础。接下来的想法很简单：我想用 iPhone **从任何地方**远程访问 Mac，让 Codex 帮我编写和迭代代码，用 Git 管理仓库，再在 Safari 中预览 Eleventy 博客构建。

为什么它吸引我？三个原因：

1. **随时兜底**：无论身在何处，都能修复或推送代码。
2. **自由试验**：不用守在书桌前，也能自在探索。
3. **一种理念**：证明创造力不需要沉重的硬件，只需要合适的连接。

这种充满可能性的感觉，推动着我继续。

---

## Cloudflare Tunnel：一番折腾

我先尝试了 **Cloudflare Tunnel**，因为它看上去在安全和便利之间取得了不错的平衡：

* 在本地运行 `cloudflared`。
* 将 `ssh.example.com` 这样的子域名接到隧道。
* 从任意地点通过 SSH 或 Mosh 连接。

纸面上很完美。它是个强大的系统：只向外发起连接，不暴露端口，还能用 Zero Trust 策略把 SSH 保护在 MFA 之后。

但实际配置起来*颇为棘手*。DNS 起初无法解析，配置还需打磨，我始终没有迎来顺利执行 `ssh user@ssh.example.com` 的满足时刻。我知道 Cloudflare 安全、适合企业，但对我的个人需求来说，感觉有点过重。

> *“这不是死路，只是提醒我：有时最简单的工具，才最合适。”*

---

## Tailscale：突破口

就在一次 Reddit 上讨论 Cloudflare Tunnel 配置 SSH 困难的聊天中，我偶然发现了 Tailscale。它是基于 WireGuard 的网状 VPN，承诺在不牺牲能力的同时保持简单。

配置真的非常容易。

Mac 上只需要几条命令：

```bash
brew install tailscale
sudo tailscaled
tailscale up
```

iPhone 上只需安装应用并登录。

Mac 和 iPhone 加入同一个 tailnet 后，两台设备立刻都拥有了私有 `100.x.x.x` IP。

<img
  alt= "Tailscale iOS 应用"
  src="/assets/images/posts/iphone-ssh/tailscale-iOS.jpeg"
  eleventy:widths="360"
  eleventy:sizes="360px"
/>

第一次从 iPhone 成功 ping 到 Mac，感觉像变魔术。

轻轻输入 `ssh/mosh nicholas@<tailscale-ip>` 就直接进入工作区，几乎毫无阻碍地实现了远程在场。

<img
  alt= "SSH"
  src="/assets/images/posts/iphone-ssh/ssh.jpg"
  eleventy:widths="360"
  eleventy:sizes="360px"
/>

当 `tailscale serve` 开始代理 Eleventy 预览时，我以为这套配置已经到顶了。

真正打开新天地的是 `tailscale serve --https=443 http://localhost:8080`。Mac 上运行 `npm run dev` 后，Serve 通过 Tailscale 的 HTTPS 暴露 Eleventy 预览，不必改 DNS 或路由器。它给了我一个整洁的 HTTPS URL，让我在沙发上、火车上、任何有信号的地方，都能看到实时博客构建。每多接通一层，喜悦就又翻一倍。

随后我发现了更简单的办法：开发服务器监听 `0.0.0.0`，也就是所有接口，因此借助 Tailscale 的 MagicDNS，在 tailnet 内已经能通过 `https://my-mac.my-tailnet.ts.net:8080` 访问。不用 Serve，也不用额外代理，私有网状网络自己就能完成。
如果之后需要访问 Umami 这类只监听 localhost，也就是 `127.0.0.1` 的服务，仍可使用 Serve（或 Funnel）发布到 tailnet。

<img
  alt= "Tailscale Serve"
  src="/assets/images/posts/iphone-ssh/tailscale-serve.jpg"
  eleventy:widths="360"
  eleventy:sizes="360px"
/>

不用猜哪个端口开着，不用管理额外证书，只需一种干净的方式，就能随处验证 Codex 的成果。

> *“这不只是能运行的代码，**这是自由**。突然之间，我走到哪里，Mac 就在哪里。”*

这就是跨越的一刻。我感觉某道门打开了，我自由了。

---

## iSH 与 Blink：选择合适的客户端

我尝试了两款 iOS 上的 SSH/Mosh 客户端。

* **iSH：** 模拟 Alpine Linux，很有趣，但因为 x86 模拟而较慢。基本 SSH 没问题，Mosh 则比较卡。
* **Blink：** SSH 和 Mosh 体验流畅，界面精致。缺点是采用订阅制。

最终 Blink 给了我最好的日常体验，虽然 iSH 也是一段有趣的支线探索。

---

## tmux + iTerm：我的工作室

连接解决了，接下来需要持久会话和舒适体验。于是 **tmux** 和 **iTerm** 登场了。

**tmux：**

* 持久会话，Mac 和 iPhone 都能接入。
* 用窗口（标签页）和窗格（分屏）组织工作流。
* 自定义自动命名、cwd 继承和鼠标支持。
* 默认布局：主编程窗格运行 Codex，右上角执行 Git 命令，右下角查看 Eleventy 日志。

**iTerm2：**

* 通过 `tmux -CC` 集成，在 Mac 上获得原生标签页和分屏。
* 本地界面精致，同时仍能与 iPhone 无缝同步。

结果就是一间真正的项目“控制室”。在 Mac 上，iTerm 用起来很自然；在 iPhone 上，tmux 提供了同一个持久工作区。重新从 iPhone 连接时，tmux 会把我带回离开时的原处，仿佛暂停再恢复一局游戏，始终“不用从沙发上起身”。

> *“这就是梦想中的工作室：Codex 指引我，Git 触手可及，日志实时滚动，全都来自口袋里的屏幕。”*

同一个 tmux “屏幕”（Codex），只是尺寸不同。

<img
  alt= "Mac 上的 Codex"
  src="/assets/images/posts/iphone-ssh/codex-mac.png"
  eleventy:widths="360"
  eleventy:sizes="360px"
/>
<img
  alt= "iPhone 上的 Codex"
  src="/assets/images/posts/iphone-ssh/codex-iPhone.jpeg"
  eleventy:widths="240"
  eleventy:sizes="240px"
/>

---

## 最终配置

最后我得到的是：

* **Tailscale**：私密、安全的连接。
* **Blink**（或 iSH）：iPhone 上的 SSH/Mosh。
* **tmux**：持久性、共享会话和布局。
* **iTerm2**：Mac 上的原生集成。
* iPhone 上的 **Safari/Firefox**：预览经 Tailscale 代理的 Eleventy 构建。

感觉像魔法：一台完整的 Mac 装进口袋，随时迎接创作冲动。

---

## 回想

这段旅程不只是工具的故事，更是获得自由的过程。能够：

* 随处大胆试验。
* 灵感一来就动手解决问题。
* 感受早上构想、傍晚实现的喜悦。

AI 是放大器。Codex 把自然语言变成能工作的代码，Tailscale 和 tmux 则确保环境始终触手可及。

> *“创造力不需要书桌。它只需要合适的连接，也许再加一点 AI 魔法。”*

---

## 结语

从 Cloudflare 的复杂到 Tailscale 的简单，从 tmux 的持久性到 iTerm 的精致，这段旅程教给我的超出了命令和配置：技术能给我们自由。随时随地写代码、创作、探索的自由。

**我不再只是家里有一台 Mac，而是口袋里有一台 Mac。**
