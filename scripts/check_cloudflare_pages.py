#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import textwrap
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any


API_URL = "https://api.cloudflare.com/client/v4"
CYAN = "\033[0;36m"
YELLOW = "\033[0;33m"
GREEN = "\033[0;32m"
RED = "\033[0;31m"
BLUE = "\033[0;34m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


STATUS_ICONS = {
    "success": "✓",
    "failure": "✗",
    "canceled": "⊘",
    "cancelled": "⊘",
    "skipped": "—",
    "active": "●",
    "idle": "○",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Show the latest Cloudflare Pages deployment for a project. "
            "Auto-polls while a build is in progress. "
            "Run via `op run --env-file=.env -- ...`."
        )
    )
    parser.add_argument(
        "project",
        nargs="?",
        help=(
            "Cloudflare Pages project name. Defaults to the current git "
            "repo name with dots and underscores normalized to hyphens "
            "(e.g. blog.clooney.io -> blog-clooney-io)."
        ),
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=5,
        choices=(5, 10),
        help="Polling interval in seconds while a build is running (default: 5)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="How many recent deployments to list in verbose mode (default: 5)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Also show stages, recent deployments, and rate-limit info",
    )
    return parser.parse_args()


def default_project_name() -> str | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None

    name = os.path.basename(result.stdout.strip())
    sanitized = re.sub(r"[^a-z0-9-]+", "-", name.lower()).strip("-")
    return sanitized or None


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if value:
        return value
    print(
        textwrap.dedent(
            f"""\
            Missing required environment variable: {name}

            Run with 1Password injecting secrets, for example:

              op run --env-file=.env -- python3 scripts/check_cloudflare_pages.py
            """
        ).rstrip(),
        file=sys.stderr,
    )
    sys.exit(1)


def api_get(path: str, token: str) -> tuple[Any, dict[str, str]]:
    request = urllib.request.Request(
        f"{API_URL}{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(request) as response:
            payload = json.load(response)
            headers = {key.lower(): value for key, value in response.headers.items()}
            return payload, headers
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf8", errors="replace")
        print(f"Cloudflare API request failed: HTTP {exc.code}", file=sys.stderr)
        if body:
            print(body, file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as exc:
        print(f"Cloudflare API request failed: {exc.reason}", file=sys.stderr)
        sys.exit(1)


def parse_iso(timestamp: str | None) -> datetime | None:
    if not timestamp:
        return None
    return datetime.fromisoformat(timestamp.replace("Z", "+00:00"))


def format_clock(timestamp: str | None) -> str:
    dt = parse_iso(timestamp)
    if not dt:
        return "-"
    return dt.astimezone().strftime("%H:%M:%S")


def format_duration(started_on: str | None, ended_on: str | None) -> str:
    started = parse_iso(started_on)
    ended = parse_iso(ended_on)
    if not started or not ended:
        return "-"
    total_seconds = max(0, int((ended - started).total_seconds()))
    minutes, seconds = divmod(total_seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours:
        return f"{hours}h {minutes}m {seconds}s"
    if minutes:
        return f"{minutes}m {seconds}s"
    return f"{seconds}s"


def format_relative(timestamp: str | None) -> str:
    dt = parse_iso(timestamp)
    if not dt:
        return "-"
    delta = datetime.now(timezone.utc) - dt.astimezone(timezone.utc)
    seconds = int(delta.total_seconds())
    if seconds < 60:
        return f"{seconds}s ago"
    minutes, _ = divmod(seconds, 60)
    if minutes < 60:
        return f"{minutes}m ago"
    hours, _ = divmod(minutes, 60)
    if hours < 24:
        return f"{hours}h ago"
    days, _ = divmod(hours, 24)
    return f"{days}d ago"


def shorten(text: str | None, width: int) -> str:
    if not text:
        return "-"
    if len(text) <= width:
        return text
    return text[: width - 1] + "…"


def first_line(text: str | None) -> str:
    if not text:
        return "-"
    return text.splitlines()[0]


def clear_screen() -> None:
    if sys.stdout.isatty():
        print("\033[2J\033[H", end="")


def colorize(text: str, color: str) -> str:
    return f"{color}{text}{RESET}"


def status_color(status: str | None) -> str:
    if status == "success":
        return GREEN
    if status in {"failure", "canceled", "cancelled"}:
        return RED
    if status == "skipped":
        return YELLOW
    if status == "idle":
        return DIM
    return CYAN


def status_icon(status: str | None) -> str:
    return STATUS_ICONS.get(status or "", "●")


def stage_duration(stage: dict[str, Any]) -> str:
    return format_duration(stage.get("started_on"), stage.get("ended_on"))


def stage_named(deployment: dict[str, Any], name: str) -> dict[str, Any]:
    for stage in deployment.get("stages") or []:
        if stage.get("name") == name:
            return stage
    return {}


def is_terminal_status(status: str | None) -> bool:
    return status in {"success", "failure", "canceled", "cancelled", "skipped"}


def print_overview(project: str, deployment: dict[str, Any]) -> None:
    latest_stage = deployment.get("latest_stage") or {}
    trigger = (deployment.get("deployment_trigger") or {}).get("metadata") or {}
    status = latest_stage.get("status", "-")
    stage_name = latest_stage.get("name", "-")

    icon = colorize(status_icon(status), status_color(status))
    label = colorize(status.upper(), status_color(status))
    print(f"{BOLD}{project}{RESET}  {icon} {label} {DIM}·{RESET} {colorize(stage_name, CYAN)}")
    print()

    when = format_relative(deployment.get("created_on"))
    branch = trigger.get("branch", "-")
    build = stage_duration(stage_named(deployment, "build"))
    deploy = stage_duration(stage_named(deployment, "deploy"))
    commit = (trigger.get("commit_hash") or "-")[:8]
    message = shorten(first_line(trigger.get("commit_message")), 72)
    preview = deployment.get("url", "-")

    print(f"  {DIM}{'when':<8}{RESET} {when:<22} {DIM}{'branch':<8}{RESET} {branch}")
    print(f"  {DIM}{'build':<8}{RESET} {build:<22} {DIM}{'deploy':<8}{RESET} {deploy}")
    print(f"  {DIM}{'commit':<8}{RESET} {commit}  {message}")
    print(f"  {DIM}{'preview':<8}{RESET} {preview}")


def print_stages(deployment: dict[str, Any]) -> None:
    stages = deployment.get("stages") or []
    if not stages:
        return
    print(f"\n{BOLD}stages{RESET}")
    for stage in stages:
        status = stage.get("status", "-")
        icon = colorize(status_icon(status), status_color(status))
        name = stage.get("name", "-")
        duration = stage_duration(stage)
        started = format_clock(stage.get("started_on"))
        if started == "-":
            print(f"  {icon} {DIM}{name}{RESET}")
        else:
            print(f"  {icon} {name:<14} {duration:<10} {DIM}{started}{RESET}")


def print_recent(deployments: list[dict[str, Any]], limit: int) -> None:
    if limit <= 0 or len(deployments) <= 1:
        return
    print(f"\n{BOLD}recent{RESET}")
    for deployment in deployments[:limit]:
        latest_stage = deployment.get("latest_stage") or {}
        trigger = (deployment.get("deployment_trigger") or {}).get("metadata") or {}
        status = latest_stage.get("status", "-")
        icon = colorize(status_icon(status), status_color(status))
        when = format_relative(deployment.get("created_on"))
        env = deployment.get("environment", "-")
        short_id = deployment.get("short_id", "-")
        message = shorten(first_line(trigger.get("commit_message")), 56)
        print(f"  {icon} {when:<10} {env:<11} {short_id:<10} {message}")


def print_rate_limit(headers: dict[str, str]) -> None:
    rate_limit = headers.get("ratelimit")
    rate_policy = headers.get("ratelimit-policy")
    if not rate_limit and not rate_policy:
        return
    print(f"\n{BOLD}rate limit{RESET}")
    print(f"  {DIM}{'current':<8}{RESET} {rate_limit or '-'}")
    print(f"  {DIM}{'policy':<8}{RESET} {rate_policy or '-'}")


def fetch_deployments(
    project: str, account_id: str, token: str
) -> tuple[list[dict[str, Any]], dict[str, str]]:
    response, headers = api_get(
        f"/accounts/{account_id}/pages/projects/{project}/deployments",
        token,
    )
    if not response.get("success"):
        print("Cloudflare API returned an unsuccessful response.", file=sys.stderr)
        print(json.dumps(response, indent=2), file=sys.stderr)
        sys.exit(1)
    deployments = response.get("result") or []
    if not deployments:
        print(f"No deployments found for project {project}.", file=sys.stderr)
        sys.exit(1)
    return deployments, headers


def watch_latest(
    project: str, account_id: str, token: str, interval: int
) -> tuple[list[dict[str, Any]], dict[str, str]]:
    while True:
        deployments, headers = fetch_deployments(project, account_id, token)
        latest = deployments[0]
        status = (latest.get("latest_stage") or {}).get("status", "-")

        clear_screen()
        print_overview(project, latest)
        print_stages(latest)

        now = datetime.now().astimezone().strftime("%H:%M:%S")
        if is_terminal_status(status):
            print(f"\n{DIM}finished at {now}{RESET}")
            return deployments, headers

        print(
            f"\n{colorize('LIVE', BLUE)} "
            f"{DIM}refresh {interval}s · updated {now} · ctrl-c to stop{RESET}"
        )
        time.sleep(interval)


def main() -> None:
    args = parse_args()
    project = args.project or default_project_name()
    if not project:
        print(
            "Could not derive a project name from the current directory. "
            "Pass one explicitly.",
            file=sys.stderr,
        )
        sys.exit(1)

    account_id = require_env("CF_ACCOUNT_ID")
    token = require_env("CF_PAGE_READ_API_TOKEN")

    deployments, headers = fetch_deployments(project, account_id, token)
    latest = deployments[0]
    status = (latest.get("latest_stage") or {}).get("status", "-")

    if not is_terminal_status(status):
        deployments, headers = watch_latest(project, account_id, token, args.interval)
        latest = deployments[0]
        status = (latest.get("latest_stage") or {}).get("status", "-")
    else:
        print_overview(project, latest)
        if args.verbose:
            print_stages(latest)

    if args.verbose:
        print_recent(deployments, args.limit)
        print_rate_limit(headers)

    sys.exit(1 if status in {"failure", "canceled", "cancelled"} else 0)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
