---
title: "Email Clients & Servers"
date: 2026-04-12
tags:
  - email
  - python
  - javascript
  - smtp
  - imap
  - mailpit
excerpt: |
  Quick reference on Python and JS/TS email tooling, threading headers, local test servers, and where Mailpit fits.
---

[[toc]]

## Python Standard Library

Python has first-class email support baked in:

- **`smtplib`** — sending email via SMTP
- **`imaplib`** — reading and managing email via IMAP
- **`email`** — constructing and parsing messages (`EmailMessage`, `email.parser`)
- **`mailbox`** — reading local mailbox formats (Maildir, mbox)
- **`smtpd`** — deprecated mock SMTP server (removed in Python 3.12)
- **`socketserver`** — low-level TCP server, useful for rolling a custom mock SMTP

### Sending (smtplib)

```python
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"
msg["Subject"] = "Hello"
msg.set_content("Body text here")

with smtplib.SMTP("smtp.example.com", 587) as smtp:
    smtp.starttls()
    smtp.login("user", "password")
    smtp.send_message(msg)
```

### Reading (imaplib)

```python
import imaplib, email

with imaplib.IMAP4_SSL("imap.example.com") as imap:
    imap.login("user", "password")
    imap.select("INBOX")
    _, ids = imap.search(None, "ALL")
    for uid in ids[0].split():
        _, data = imap.fetch(uid, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        print(msg["subject"], msg["from"])
```

### Mock SMTP Server (aiosmtpd — recommended)

```python
from aiosmtpd.controller import Controller
from aiosmtpd.handlers import AsyncMessage

class MyHandler(AsyncMessage):
    async def handle_message(self, message):
        print(f"Subject: {message['subject']}")

controller = Controller(MyHandler(), hostname="127.0.0.1", port=1025)
controller.start()
```

---

## JavaScript / TypeScript

JS/TS has **no standard library for email**. The language was born in the browser where direct TCP socket access is blocked. Node.js has low-level primitives (`net`, `tls`) but email was never added to core.

### What Node.js provides

| Module | Relevance |
| --- | --- |
| `net` | Raw TCP sockets — could implement SMTP by hand |
| `tls` | TLS wrapping for SMTPS/IMAPS |
| `crypto` | Hashing for auth mechanisms |
| `stream` | Handling large message bodies |

### The ecosystem answer (npm)

| Need | Package |
| --- | --- |
| Sending | `nodemailer` |
| Mock SMTP server | `smtp-server` (nodemailer family) |
| IMAP / receiving | `imapflow` |
| Parse raw messages | `mailparser` |

---

## How Email Threading Works

Every email is an individual message. Threading is layered on top via **headers**:

```text
Message-ID: <abc123@mail.example.com>       ← unique ID for this message
In-Reply-To: <xyz789@mail.example.com>      ← ID of the message being replied to
References: <xyz789@...> <abc123@...>       ← full chain of ancestor IDs
```

- The **server** stores flat, individual messages — no tree structure
- The **client** reconstructs threads by building a graph from these headers
- **Fallback**: if `In-Reply-To` is missing, clients match on `Subject` (stripping `Re:`, `Fwd:` etc.) — this is fuzzy and can cause incorrect grouping
- **Gmail extension**: adds a proprietary `X-GM-THRID` header so its IMAP server can return all messages in a thread directly, without client-side reconstruction

---

## Third-Party Libraries & Apps (Python)

### Libraries

| Library | Purpose |
| --- | --- |
| `aiosmtpd` | Modern async SMTP server (replaces deprecated `smtpd`) |
| `mailbox` (stdlib) | Read/write Maildir, mbox formats |
| `flanker` | Robust email address and MIME parsing |
| `imaplib2` | Async-capable drop-in for stdlib `imaplib` |

### Local Mail Server Applications

| Tool | Purpose |
| --- | --- |
| **Mailpit** | Lightweight SMTP catcher with web UI — dev/test only |
| **smtp4dev** | Similar to Mailpit, cross-platform |
| **Postfix + Dovecot** | Production-grade SMTP + IMAP — heavy but full-featured |
| **Maildrop** | Minimal local delivery agent |

---

## Mailpit

A lightweight, single-binary SMTP catcher for development and testing.

### What it is

- Accepts SMTP connections on `localhost:1025`
- Captures all mail — nothing is delivered unless explicitly configured
- Provides a web UI at `localhost:8025` and a REST API for integration testing
- Also offers an optional POP3 server

### Sending / Relay Modes

| Mode | Behaviour |
| --- | --- |
| Default | Captures mail, never sends it anywhere |
| SMTP Relay (manual) | Capture + manually "release" via web UI to a real SMTP server |
| Relay All | Capture + automatically forward everything via a real SMTP server |
| SMTP Forwarding | Capture + send a copy to a fixed address automatically |

Relay requires a config file:

```yaml
host: smtp.gmail.com
port: 587
starttls: true
auth: plain
username: you@gmail.com
password: your-app-password
```

### What Mailpit Does NOT Support

- **Multiple mailboxes** — all captured mail lands in one shared inbox regardless of recipient. This was requested and closed as not planned. Workaround: run separate instances on different ports.
- **Fetching external mail** — Mailpit has no IMAP client. It cannot connect to Gmail or any external server. It only receives mail sent directly to it.

### Mailpit is not an email client

It cannot be used to read a real inbox (Gmail, Outlook, etc.). For that you need:

- A real IMAP client library (`imaplib`, `imapflow`)
- Or a desktop client (Thunderbird, Spark, etc.)
- Or a terminal client (aerc, neomutt)
- Or a sync tool (`mbsync`, `offlineimap`) to pull mail to a local Maildir
