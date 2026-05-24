---
name: dev server
description: Run the 11ty dev server and expose it over Tailscale on the same port.
---

## Steps

1. Start the dev server in the background.

   ```
   npm run dev
   ```

2. Wait for the server line and extract the port. 11ty prints `[11ty] Server at http://localhost:<port>/`. The port is dynamic, so always read it from the actual output rather than assuming `8080`.

3. Serve through Tailscale on the **same port** as the local server.

   ```
   tailscale serve --bg --https=<port> <port>
   ```

   The result is `https://<host>.ts.net:<port>/` proxying `http://127.0.0.1:<port>`.

## Notes

- Match the Tailscale HTTPS port to the local port. Do not default to 443.
- Only kill existing `eleventy --serve` or `npm run dev` processes when the user specifically asks to.
- If a previous serve is bound to a different port, leave it unless the user asks to clean up. Check with `tailscale serve status`.
- To stop the Tailscale proxy: `tailscale serve --https=<port> off`.
