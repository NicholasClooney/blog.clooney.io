---
title: "通过 Email Routing 和 Email Worker 接收 Cloudflare 构建通知"
date: 2026-04-12
tags:
  - cloudflare
  - workers
  - devops
  - infra
  - automation
  - webhooks
---

用 Cloudflare Email Routing 和 Email Worker 作为衔接层，把 Workers / Pages 的构建状态，也就是成功或失败，发送到 webhook。本文以 Discord 为目标，但同样的模式也适用于 Slack、Telegram、Linear，或任何能接收传入 webhook 的服务。

这套配置生成的 Discord 消息大致如下：

<img
  alt="Discord 中的 Cloudflare Builds webhook 消息，显示构建成功的嵌入卡片"
  src="/assets/images/posts/cloudflare-email-to-webhook/discord-webhook-message.png"
  style="display: block; margin: 0 auto; width: 400px; height: auto; max-width: 100%;"
/>

[[toc]]

---

## 为什么这样做？

Cloudflare Workers 和 Pages 可以在部署完成或失败时发送通知邮件。Email Routing 能把这些邮件交给 Worker 处理，而不是转发到普通邮箱。Worker 再从邮件正文解析实际状态，构建格式化的数据，通过 `fetch()` 请求 webhook URL。

无需第三方服务，密钥不用离开 Cloudflare，而且整套流程可以在免费套餐上运行。

---

## 前提条件

- 一个 Cloudflare 账户，以及由 Cloudflare DNS 管理的域名。
- 在该域名上启用 Email Routing，入口是控制台 > **Email** > **Email Routing**。
- 一个已开启部署通知的 Workers 或 Pages 项目。
- 一个你有权限创建 webhook 的 Discord 服务器。

---

## 第 1 步：启用部署通知

### Workers

进入 **Workers & Pages** > 你的 Worker > **Settings** > **Notifications**。添加路由地址，例如 `builds@yourdomain.com`，作为部署成功和失败事件的通知邮箱。

### Pages

进入 **Workers & Pages** > 你的 Pages 项目 > **Settings** > **Notifications**。为你关心的构建事件添加同一个路由地址。

---

## 第 2 步：创建 Discord webhook

在 Discord 服务器中进入 **Server Settings** > **Integrations** > **Webhooks** > **New Webhook**。选择频道，起个名字，然后复制 webhook URL，格式类似：

```text
https://discord.com/api/webhooks/<id>/<token>
```

把它保存为 Email Worker 的密钥，见第 4 步。

---

## 第 3 步：创建 Email Worker

控制台有两条路径可以进入 Email Workers。

**方式 A：**进入 **Workers & Pages** > **Create** > **Worker**，选择 **“Start with Hello World!”**，给 Worker 起一个像 `build-notifier` 这样的名字。

**方式 B：**直接进入 **Email** > **Email Routing** > **Email Workers**，会到达同一个 Worker 创建流程。

无论走哪条路径，创建后都把默认脚本替换成下面的代码。无需外部依赖：`message.raw` 是一个 `ReadableStream`，用 `Response` 包起来，就能直接调用 `.text()` 读取原始 MIME 源文，足够用来检查状态关键词。

```js
export default {
  async email(message, env, ctx) {
    const subject = message.headers.get("subject") ?? "(no subject)";

    // Read the raw MIME source -- no library needed
    const body = await new Response(message.raw).text();

    const project = subject.match(/project ([\w-]+)/i)?.[1] ?? subject;

    const [title, color, description] = /succeeded|success/i.test(body)
      ? ["Build succeeded", 0x57f287, `✅ ${project} has built successfully.`] // green
      : /failed|failure|error/i.test(body)
        ? ["Build failed", 0xed4245, `❌ Build failed: ${project}`] // red
        : ["Unknown state", 0x888888, `Unknown build state: ${project}`]; // gray

    await postToDiscord(env, { title, description, color });
  },
};

async function postToDiscord(env, { title, description, color }) {
  const payload = {
    username: "Cloudflare Builds",
    avatar_url: "https://workers.cloudflare.com/resources/logo/logo.svg",
    embeds: [
      {
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const res = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Discord webhook returned ${res.status}: ${body}`);
  }
}
```

### 这段代码做什么

- 通过 `new Response(message.raw).text()` 读取原始 MIME 源文，无需依赖。
- 尽可能从邮件主题提取项目名，匹配不到时就使用完整主题。
- 对正文进行模式匹配，得到三种状态之一：“Build succeeded”（绿色）、“Build failed”（红色）或 “Unknown state”（灰色）。无论匹配到哪种状态，都会发送 Discord 消息。
- 发布一个格式化的嵌入卡片，包含简短状态信息和时间戳。

### Discord 嵌入卡片数据说明

这里使用的嵌入卡片数据结构符合当前 Discord API。有几点需要了解：

- `color` 必须是十进制整数，不能是十六进制字符串。在 JS 中，`0x57f287` 的值是十进制 `5763719`，这就是 Discord 需要的形式。
- `timestamp` 必须是 ISO 8601 字符串，Discord 会按用户的本地时区显示。
- `embeds` 是数组，每条消息最多包含 10 个嵌入卡片。
- `username` 和 `avatar_url` 只针对当前消息覆盖 webhook 的默认显示名称和头像。
- `content`、`embeds`、`attachments` 至少要有一个，否则 Discord 返回 400。

---

## 第 4 步：添加 webhook 密钥

在 Worker 的 **Settings** > **Variables** 中添加一个 secret，而不是明文变量：

| 名称 | 值 |
|---|---|
| `DISCORD_WEBHOOK_URL` | 第 2 步复制的 Discord webhook URL |

使用密钥，可以避免 URL 出现在源码或 Cloudflare 的明文变量存储中。

---

## 第 5 步：配置 Email Routing

进入 **Email** > **Email Routing** > **Routing Rules** > **Custom addresses**，添加规则：

| 字段 | 值 |
|---|---|
| **Email address** | `builds@yourdomain.com`，也就是第 1 步使用的地址 |
| **Action** | Send to a Worker |
| **Worker** | `build-notifier` |

保存规则。现在，发到这个地址的所有邮件都会直接交给 Worker。

---

## 整体如何串起来

```text
Workers / Pages build event
  |  (sends notification email)
  v
builds@yourdomain.com
  |  (Cloudflare Email Routing intercepts)
  v
build-notifier Worker  (email handler)
  |  (reads raw MIME body, builds Discord embed)
  v
Discord webhook  ->  #deployments channel
```

---

## 可以怎样定制

**用 Slack 替代 Discord**
Slack 的传入 webhook 数据使用 `text` 或 `blocks`，而不是 `embeds`。更换数据结构即可，路由和 Worker 结构保持不变。

**从正文提取更丰富的信息**
`new Response(message.raw).text()` 读取的原始 MIME 源文包含完整邮件内容。如果 Cloudflare 邮件中有项目名、分支、提交 SHA 或构建耗时，可以用正则提取，再作为 `fields` 加入 Discord 嵌入卡片，让呈现更清楚。

**按项目名筛选**
从主题或正文解析项目名，只把生产部署发到 Discord，把预发布环境的失败发到更安静的地方。

**保存构建历史**
发送到 Discord 前，先向 Workers KV 或 D1 写入一条记录，就能得到可查询的构建结果历史。

**多个目标**
在同一个处理函数里多次调用 `fetch()`：一次发 Discord，一次发 Slack 频道，构建失败时再发到 PagerDuty 端点。Email Routing 只投递一次邮件，Worker 决定发往哪里。

---

## 容易踩的坑

- **域名必须启用 Email Routing。** 自定义地址不能用于子域名，或你未在 Cloudflare 中控制的外部域名。
- **Worker 必须迅速响应。** Cloudflare 会对邮件处理函数设置超时。直接调用 `fetch()`，避免串联多个缓慢请求。
- **Cloudflare 通知邮件的格式可能变化。** 正文匹配是一种启发式处理。如果 Cloudflare 改了通知措辞，需要更新正则。在生产环境完全信任解析结果前，先观察一两次构建的 Workers Logs。
- **免费套餐限制。** 免费 Workers 每天允许 100,000 次请求。构建通知数量很少，实际不太需要担心。
