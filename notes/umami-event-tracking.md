---
title: "Umami Event Tracking"
date: 2026-04-14
tags:
  - analytics
  - umami
  - javascript
  - tracking
excerpt: |
  Quick reference for loading Umami, tracking custom events from buttons, and verifying that `window.umami` is available.
---

Quick reference for wiring up Umami event tracking and verifying that the client script has loaded correctly.

[[toc]]

## Prerequisites

You need the Umami script tag on your page before anything else works:

```html
<script
  defer
  src="https://your-umami-instance.com/script.js"
  data-website-id="your-website-id"
></script>
```

- **`src`** - your Umami instance URL (self-hosted or Umami Cloud)
- **`data-website-id`** - the unique ID for your site from the Umami dashboard

Once this is on the page, `window.umami` is injected automatically.

---

## Tracking a Button Press

### Option 1: JavaScript (`window.umami.track`)

```js
window.umami.track('event-name', { optional: 'payload' });
```

Example with a button:

```jsx
<button onClick={() => window.umami.track('signup-clicked', { plan: 'pro' })}>
  Sign Up
</button>
```

The first argument is the event name, which appears in your Umami dashboard. The second is an optional properties object for custom data.

### Option 2: Data Attributes (no JS required)

```html
<button data-umami-event="signup-clicked">Sign Up</button>
```

You can attach additional properties via extra attributes:

```html
<button
  data-umami-event="signup-clicked"
  data-umami-event-plan="pro"
  data-umami-event-location="hero"
>
  Sign Up
</button>
```

Umami's script picks these up automatically on click with no `onClick` handler needed. This is useful for static HTML or when you want to keep tracking out of your component logic.

---

## Verifying `window.umami` Exists

In the browser console:

```js
window.umami
// Should log an object with track and identify methods

typeof window.umami !== 'undefined'
// true if loaded
```

Quick functional test. Paste this in the console and check your Umami dashboard under **Events**:

```js
window.umami?.track('test-event')
```

### Guarding in code

Optional chaining is usually enough:

```js
window.umami?.track('button-clicked');
```

Or use an explicit guard if you need it:

```js
if (typeof window.umami !== 'undefined') {
  window.umami.track('button-clicked');
}
```

If the script is in your `<head>` and loads before your JS runs, it should be present. Optional chaining is mostly just a safety net.
