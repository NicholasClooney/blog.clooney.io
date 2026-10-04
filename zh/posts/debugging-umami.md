---
title: "与 Safari 和 Cloudflare 较劲：调试 Umami 统计"
date: 2025-10-02
tags:
  - umami
  - security
  - infra
  - networking
  - devops
---

今天大半天，我都在让 Umami 统计与一个经过 Cloudflare 和 Nginx 代理的静态博客配合起来。追踪脚本在 Safari 中有 CORS 问题，而在 Firefox 中，开发者工具的 Network 标签页什么也看不到。

这篇记录了我如何沿着线索，从神秘重定向追到幽灵般的 CORS 问题，最后找到 Firefox 隐身的 `sendBeacon` API。

[[toc]]

## 症状：没有事件，也没有报错

- `script.js` 在所有浏览器中都加载了。
- 流量经过 Cloudflare。
- 然后由 Nginx 对外提供追踪脚本和 API 端点。
- Umami 仪表盘一直空着。
- Firefox 开发者工具完全看不到 `/api/send` 请求，Safari 则提示 CORS 问题。

这些现象组合起来，很像“基础设施出了问题”，于是我从网络边缘开始排查。

## 第 1 步：无限 301 循环

一个简单的 POST 请求就说明了问题：

```bash
curl -i -X POST https://analytics.clooney.ninja/api/send \
  -H 'Content-Type: application/json' \
  -d '{"type":"test","payload":"hello from curl"}'
```

响应是 `HTTP/2 301`。Cloudflare 的 SSL 模式设为 **Flexible**，意味着它通过 HTTP 连接源站。而 Nginx 又把所有 HTTP 请求重定向到 HTTPS：

```nginx
server {
    listen 80;
    server_name analytics.clooney.ninja;
    return 301 https://$host$request_uri;
}
```

Cloudflare 老老实实把重定向转发回浏览器，即使浏览器本来已经在使用 HTTPS。把站点的模式切换为 **Full (Strict)** 后，循环解除了，手动 POST 也开始返回有用的错误：`HTTP/2 400`，提示测试用的假数据有问题。

## 第 2 步：Safari 收到 204，却没有 CORS 头

HTTPS 修好后，Safari 仍然拒绝从页面发送数据：

```
Origin https://blog.nicholas.clooney.io is not allowed by Access-Control-Allow-Origin. Status code: 204
```

预检 `OPTIONS` 请求命中了站点模板（`roles/umami_nginx/templates/analytics.conf.j2`）中的这一段：

```nginx
location = /api/send {
    ...
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    if ($request_method = OPTIONS) {
        add_header Content-Length 0;
        add_header Content-Type text/plain;
        return 204;
    }
}
```

进入预检分支时，Nginx 返回了 204，却没有重新附上 CORS 响应头。Safari 把它当成不支持 CORS 的响应，终止了真正的 POST。解决办法是在条件判断之前设置响应头，再添加 `Vary`，让缓存区分不同来源：

```nginx
    add_header Access-Control-Allow-Origin "$http_origin" always;
    add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Max-Age 86400 always;
    add_header Vary "Origin" always;

    if ($request_method = OPTIONS) {
        return 204;
    }
```

现在 Safari 的预检成功了。

## 第 3 步：上游带来的重复响应头

接着，Safari 换了一种抱怨：

```
Access-Control-Allow-Origin cannot contain more than one origin.
```

Umami 本身会在响应中添加 `Access-Control-Allow-Origin: *`。加上上面的 Nginx 响应头后，响应里就同时出现了 `https://blog.nicholas.clooney.io` 和 `*`。尽管 curl 中看起来只有一个响应头，Safari 还是拒绝了。

解决办法：隐藏上游的响应头，让 Nginx 统一输出一套。

```nginx
    proxy_hide_header Access-Control-Allow-Origin;
    proxy_hide_header Access-Control-Allow-Methods;
    proxy_hide_header Access-Control-Allow-Headers;
    proxy_hide_header Access-Control-Max-Age;
```

重新加载 Nginx 后，Safari 终于不再抱怨，能发送事件了。

## 第 4 步：Firefox 把请求藏哪儿了？

Firefox 看起来还是没动静，Network 标签页里没有 `api/send`。但 Umami 仪表盘已经开始显示新事件，所以请求确实存在。缺失的一环是：Umami 使用 `navigator.sendBeacon`，Firefox 把它归类为 **Other**，或者在事件触发前没有打开开发者工具时，干脆不显示它。

为了确认，我在页面加载**之前**打开开发者工具，启用 “Persist Logs”，并选择 **All** 过滤条件。还是没有……

最后不得不通过 `about:logging` 开一段日志记录，才看到 `/api/send` 事件。终于……

## 学到的教训

- Cloudflare Flexible SSL 加上源站 HTTPS 重定向，会形成无限 301 循环。把站点设为 Full (Strict)。
- 预检的 204 响应必须包含*所有* CORS 响应头；Nginx 的 `if` 块不会自动添加它们。
- 在代理层重写 CORS 头时，应隐藏上游 CORS 头。重复的 `Access-Control-Allow-Origin` 值会让 Safari 拒绝响应。
- `navigator.sendBeacon` 不会显示在 Firefox 开发者工具的网络标签页中。
- 只要按来源定制响应，就添加 `Vary: Origin`，尤其是在 CDN 后面。

## 实用命令与配置

- 检查是否还有重定向：

  ```bash
  curl -I https://<your-analytics>/api/send
  ```

- 验证预检响应头：

  ```bash
  curl -i -X OPTIONS https://<your-analytics>/api/send \
    -H 'Origin: <your-site>' \
    -H 'Access-Control-Request-Method: POST' \
    -H 'Access-Control-Request-Headers: content-type'
  ```

- `/api/send` 的最终 Nginx 配置片段：

  ```nginx
  location = /api/send {
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      limit_except POST OPTIONS { deny all; }

      proxy_hide_header Access-Control-Allow-Origin;
      proxy_hide_header Access-Control-Allow-Methods;
      proxy_hide_header Access-Control-Allow-Headers;
      proxy_hide_header Access-Control-Max-Age;

      add_header Access-Control-Allow-Origin "$http_origin" always;
      add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
      add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
      add_header Access-Control-Max-Age 86400 always;
      add_header Vary "Origin" always;

      if ($request_method = OPTIONS) {
          return 204;
      }
  }
  ```

最初只是“追踪器怎么不工作？”，最后却变成一场横跨 Cloudflare、Nginx、Safari 和 Firefox 的分层调试。现在仪表盘能即时更新了，下次代理与 CORS 再凑到一起添乱，我也有了一份可参考的排查手册。
