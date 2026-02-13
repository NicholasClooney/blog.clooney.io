---
draft: true
title: "MATERIAL: Docker + 11ty Stability Analysis & Playbook"
---

# Docker + 11ty Stability Playbook

Use this as a standard across repos that run 11ty in Docker.

## Symptoms to watch for

- `docker ps` feels slow or hangs intermittently.
- Containers show low uptime repeatedly (`Up 1-3 minutes`).
- Containers flip between `health: starting` and `unhealthy`.
- Logs contain `Killed` (often memory pressure / OOM).

## Root causes seen in this stack

- Shared `node_modules` volume between `dev` and `prod` containers.
- `npm install` running on every container start.
- Aggressive file polling (`CHOKIDAR_USEPOLLING=1`) across many repos.
- Healthcheck timings too strict for startup/build/install time.
- `restart: unless-stopped` causing noisy restart loops for non-critical services.

## Baseline Compose pattern (recommended)

```yaml
services:
  dev:
    image: node:22-bookworm-slim
    working_dir: /app
    restart: on-failure:3
    volumes:
      - ./:/app:cached
      - node_modules_dev:/app/node_modules
      - site_dev:/app/_site
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=1
      - CHOKIDAR_INTERVAL=700
    command: sh -lc "npm ci && npm run dev"
    healthcheck:
      test: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:8080', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))\""]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s

  prod:
    image: node:22-bookworm-slim
    working_dir: /app
    restart: on-failure:3
    volumes:
      - ./:/app:cached
      - node_modules_prod:/app/node_modules
      - site_prod:/app/_site
    environment:
      - NODE_ENV=production
      - CHOKIDAR_USEPOLLING=0
    command: sh -lc "npm ci && npm run prod"
    healthcheck:
      test: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:8080', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))\""]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 90s

volumes:
  node_modules_dev:
  node_modules_prod:
  site_dev:
  site_prod:
```

## Notes on the baseline

- Separate volumes for `dev` and `prod` avoids dependency tree contention.
- `npm ci` is more deterministic than `npm install` for repeatable startup.
- Polling interval `700ms` reduces filesystem pressure vs `200ms`.
- Disable polling in `prod` unless you truly need live watch behavior.
- `on-failure:3` prevents endless restart loops when a process exits repeatedly.

## Rollout checklist for each repo

1. Split `node_modules` volumes by service (`*_dev`, `*_prod`).
2. Split `_site` volumes by service.
3. Replace `restart: unless-stopped` with `restart: on-failure:3` for app services.
4. Use `npm ci` in commands.
5. Increase healthcheck `start_period`, `timeout`, and `interval`.
6. Lower file watcher load (higher `CHOKIDAR_INTERVAL`, polling off in `prod`).
7. Recreate containers and volumes after Compose changes.

## Safe reset commands after updating compose

```bash
docker compose down
docker volume rm <project>_node_modules_dev <project>_node_modules_prod 2>/dev/null || true
docker compose up -d
```

If you changed volume names, Docker usually creates fresh volumes automatically; explicit removal is optional but helps clear bad state.

## Quick diagnostic commands

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.RunningFor}}'
docker inspect -f '{{.Name}} restart={{.RestartCount}} oom={{.State.OOMKilled}} exit={{.State.ExitCode}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' <container>
docker stats --no-stream
docker logs --tail 120 --since 20m <container>
```

## Optional hardening

- Add container memory limits via Compose (`mem_limit`) if one repo can starve others.
- Pin Node image versions consistently across repos.
- Build a dedicated production image so runtime containers do not install deps at startup.

