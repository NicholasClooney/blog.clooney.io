---
title: "Umami 事件追踪"
date: 2026-04-14
tags:
  - analytics
  - umami
  - javascript
  - tracking
excerpt: "快速查阅如何加载 Umami、追踪按钮触发的自定义事件，以及确认 `window.umami` 已可用。"
---

这是一份接入 Umami 事件追踪、确认客户端脚本正确加载的速查笔记。

[[toc]]

## 前提条件

首先，页面上必须有 Umami 的 script 标签，后续功能才能工作：

```html
<script
  defer
  src="https://your-umami-instance.com/script.js"
  data-website-id="your-website-id"
></script>
```

- **`src`**：你的 Umami 实例 URL，可以是自托管实例或 Umami Cloud。
- **`data-website-id`**：Umami 仪表盘中该网站的唯一 ID。

把它放到页面上后，`window.umami` 就会自动注入。

---

## 追踪按钮点击

### 方式 1：JavaScript（`window.umami.track`）

```js
window.umami.track('event-name', { optional: 'payload' });
```

按钮示例：

```jsx
<button onClick={() => window.umami.track('signup-clicked', { plan: 'pro' })}>
  Sign Up
</button>
```

第一个参数是事件名称，会显示在 Umami 仪表盘中。第二个参数是可选的属性对象，用来携带自定义数据。

### 方式 2：Data 属性（无需 JS）

```html
<button data-umami-event="signup-clicked">Sign Up</button>
```

可以用额外的属性附带更多信息：

```html
<button
  data-umami-event="signup-clicked"
  data-umami-event-plan="pro"
  data-umami-event-location="hero"
>
  Sign Up
</button>
```

点击时，Umami 脚本会自动读取这些属性，无需 `onClick` 处理函数。这很适合静态 HTML，也适合不想把追踪代码放进组件逻辑的情况。

---

## 确认 `window.umami` 存在

在浏览器控制台中：

```js
window.umami
// Should log an object with track and identify methods

typeof window.umami !== 'undefined'
// true if loaded
```

做一次简单的功能测试。把下面这段粘贴到控制台，然后查看 Umami 仪表盘中的 **Events**：

```js
window.umami?.track('test-event')
```

### 在代码中加保护

通常用可选链就够了：

```js
window.umami?.track('button-clicked');
```

需要时也可以显式判断：

```js
if (typeof window.umami !== 'undefined') {
  window.umami.track('button-clicked');
}
```

如果脚本位于 `<head>` 中，并在你的 JS 执行前加载完毕，它应该已经可用。可选链主要是作为一道保险。
