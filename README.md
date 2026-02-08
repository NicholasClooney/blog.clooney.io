# blog.clooney.io

Source for [Nicholas Clooney's blog](https://blog.nicholas.clooney.io/). I write about moving fast on personal projects, developer workflows, and the tools that make side quests fun to build.

Highlights:
- [Building My Own Subspace Builder](https://blog.nicholas.clooney.io/posts/building-my-own-subspace-builder/) — shipping a custom Eleventy + Tachyons setup for rapid iterations.
- [Building with GPT-5 Codex: My Experience](https://blog.nicholas.clooney.io/posts/building-with-gpt-5-codex-my-experience/) — pairing with AI to accelerate creative coding.
- [Responsive Images with Eleventy Img](https://blog.nicholas.clooney.io/posts/responsive-images-eleventy-img/) — keeping the site fast without sacrificing visuals.
- [SSH from iPhone to Mac](https://blog.nicholas.clooney.io/posts/ssh-from-iPhone-to-Mac/) — remote dev experiments from anywhere.

Drop by the blog for new posts and ideas as they land.

## Docker
- `compose.yml` uses the stock `node:25-bookworm-slim` image and installs dependencies at container start.
- Default mode (public ports): `docker compose up -d`
- Dev: `http://127.0.0.1:8080`
- Prod: `http://127.0.0.1:8090`
- Shared-edge mode (no host ports; for reverse proxy via Caddy on the `edge` network): `docker network create edge 2>/dev/null || true`
- Run: `docker compose -f compose.yml -f compose.edge.yml up -d`
- Caddy (in the ingress stack) should `reverse_proxy` to the `dev` or `prod` container names on the `edge` network.
