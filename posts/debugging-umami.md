---
title: "Wrestling Safari and Cloudflare: Debugging Umami Analytics"
date: 2025-10-02
eleventyNavigation:
  key: debugging-umami
---

I spent the better half of today getting Umami analytics to cooperate with a static blog served through Cloudflare and an Nginx proxy. The tracking script was having issue in Safari (CORS) and Firefox (nothing showed up in the Developer Tools' Network tab).

This is the story of following the trail from mysterious redirects to CORS ghosts and finally to Firefox’s stealthy `sendBeacon` API.

[[toc]]

## The Symptom: No Events, No Errors
- `script.js` loaded in every browser.
- The traffic goes through Cloudflare.
- Then Nginx expoes the tracking script & API endpoint.
- Umami dashboard stayed empty.
- Firefox DevTools didn’t show the `/api/send` request at all. While Safari complained about CORS issues.

That combination screamed “infrastructure problem”, so I started from the network edge.

## Step 1: The Infinite 301 Loop

Running a simple POST told me everything:

```bash
curl -i -X POST https://analytics.clooney.ninja/api/send \
  -H 'Content-Type: application/json' \
  -d '{"type":"test","payload":"hello from curl"}'
```

The response was `HTTP/2 301`. Cloudflare’s SSL mode was set to **Flexible**, meaning it talked to the origin over HTTP. Nginx, in turn, redirected every HTTP request to HTTPS:

```nginx
server {
    listen 80;
    server_name analytics.clooney.ninja;
    return 301 https://$host$request_uri;
}
```

Cloudflare dutifully forwarded that redirect back to the browser, even though the browser was already on HTTPS. Switching the zone to **Full (Strict)** fixed the loop and the manual POST started returning useful errors (`HTTP/2 400` complaining about the dummy payload).

## Step 2: Safari’s 204 Without CORS

With HTTPS sorted, Safari still refused to send data from the page:

```
Origin https://blog.nicholas.clooney.io is not allowed by Access-Control-Allow-Origin. Status code: 204
```

The preflight `OPTIONS` request hit this block in the site template (`roles/umami_nginx/templates/analytics.conf.j2`):

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

During the preflight branch, Nginx returned 204 but never reissued the CORS headers. Safari treated the response as non-CORS and killed the real POST. The fix was to set the headers before the conditional and add the `Vary` header so caches keep origins separate:

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

Now Safari’s preflight succeeded.

## Step 3: Double Headers From Upstream

Safari then changed its complaint to:

```
Access-Control-Allow-Origin cannot contain more than one origin.
```

Umami itself appends `Access-Control-Allow-Origin: *` to responses. With the Nginx headers above, the response now contained both `https://blog.nicholas.clooney.io` and `*`. Safari bailed out even though a single header appeared in curl.

Solution: hide the upstream headers and let Nginx publish the canonical set.

```nginx
    proxy_hide_header Access-Control-Allow-Origin;
    proxy_hide_header Access-Control-Allow-Methods;
    proxy_hide_header Access-Control-Allow-Headers;
    proxy_hide_header Access-Control-Max-Age;
```

After reloading Nginx, Safari finally posted events without complaint.

## Step 4: Where Did Firefox Put My Request?

Firefox still looked dead—no `api/send` in the Network tab. But the Umami dashboard started showing the new events, so the request was real. The missing piece: Umami uses `navigator.sendBeacon`, which Firefox categorises as **Other** (or hides entirely unless DevTools are open before the event fires).

To confirm, I opened DevTools **before** the page load, enabled “Persist Logs,” and filtered by **All**. Still no...

I had to do a `about:logging` logging session to see the `/api/send` event. Finally...

## Lessons Learned

- Cloudflare Flexible SSL + origin HTTPS redirect = infinite 301 loop. Set the zone to Full (Strict).
- Preflight 204 responses must contain *all* CORS headers; Nginx `if` blocks don’t add headers automatically.
- Hide upstream CORS headers when you rewrite them at the proxy. Duplicate `Access-Control-Allow-Origin` values break Safari.
- `navigator.sendBeacon` doesn’t surface in the Firefox Developer Tool's Networking tab.
- Add `Vary: Origin` whenever you tailor responses per origin, especially behind CDNs.

## Handy Commands & Config

- Check for lingering redirects:
  ```bash
  curl -I https://<your-analytics>/api/send
  ```
- Validate preflight headers:
  ```bash
  curl -i -X OPTIONS https://<your-analytics>/api/send \
    -H 'Origin: <your-site>' \
    -H 'Access-Control-Request-Method: POST' \
    -H 'Access-Control-Request-Headers: content-type'
  ```
- Final Nginx snippet for `/api/send`:
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

What started as “why doesn’t the tracker work?” turned into a layered debugging session across Cloudflare, Nginx, Safari, and Firefox. Now the dashboard updates instantly—and I have a reference playbook the next time a combination of proxies and CORS gets in the way.
