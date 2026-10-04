---
title: "邮件客户端与服务器"
date: 2026-04-12
tags:
  - email
  - python
  - javascript
  - smtp
  - imap
  - mailpit
excerpt: |
  Python 和 JS/TS 邮件工具、会话邮件头、本地测试服务器，以及 Mailpit 定位的速查笔记。
---

[[toc]]

## Python 标准库

Python 内置了完善的邮件支持：

- **`smtplib`**：通过 SMTP 发送邮件
- **`imaplib`**：通过 IMAP 读取和管理邮件
- **`email`**：构造和解析邮件（`EmailMessage`、`email.parser`）
- **`mailbox`**：读取本地邮箱格式（Maildir、mbox）
- **`smtpd`**：已弃用的模拟 SMTP 服务器（Python 3.12 中已移除）
- **`socketserver`**：底层 TCP 服务器，可用于自行实现模拟 SMTP

### 发送（smtplib）

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

### 读取（imaplib）

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

### 模拟 SMTP 服务器（推荐 aiosmtpd）

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

JS/TS **没有邮件标准库**。这门语言诞生于浏览器，而浏览器禁止直接访问 TCP socket。Node.js 有底层能力（`net`、`tls`），但邮件功能一直没有加入核心。

### Node.js 提供了什么

| 模块 | 相关用途 |
| --- | --- |
| `net` | 原始 TCP socket，可以手工实现 SMTP |
| `tls` | 为 SMTPS/IMAPS 提供 TLS 封装 |
| `crypto` | 认证机制所需的哈希计算 |
| `stream` | 处理较大的邮件正文 |

### 生态中的答案（npm）

| 需求 | 包 |
| --- | --- |
| 发送 | `nodemailer` |
| 模拟 SMTP 服务器 | `smtp-server`（nodemailer 家族） |
| IMAP／接收 | `imapflow` |
| 解析原始邮件 | `mailparser` |

---

## 邮件会话如何组织

每封邮件都是独立的消息。会话关系是在此之上，通过**邮件头**建立的：

```text
Message-ID: <abc123@mail.example.com>       ← unique ID for this message
In-Reply-To: <xyz789@mail.example.com>      ← ID of the message being replied to
References: <xyz789@...> <abc123@...>       ← full chain of ancestor IDs
```

- **服务器**平铺存储各封独立邮件，没有树结构
- **客户端**根据这些邮件头构建关系图，重建会话
- **回退方式**：缺少 `In-Reply-To` 时，客户端按 `Subject` 匹配（去掉 `Re:`、`Fwd:` 等前缀）。这种模糊匹配可能导致错误归组
- **Gmail 扩展**：添加专有的 `X-GM-THRID` 邮件头，让其 IMAP 服务器直接返回一个会话的全部邮件，无需客户端重建

---

## 第三方库与应用（Python）

### 库

| 库 | 用途 |
| --- | --- |
| `aiosmtpd` | 现代异步 SMTP 服务器，替代已弃用的 `smtpd` |
| `mailbox`（标准库） | 读写 Maildir、mbox 格式 |
| `flanker` | 稳健的邮件地址与 MIME 解析 |
| `imaplib2` | 支持异步、可直接替换标准库 `imaplib` 的实现 |

### 本地邮件服务器应用

| 工具 | 用途 |
| --- | --- |
| **Mailpit** | 带 Web UI 的轻量 SMTP 捕获工具，仅用于开发／测试 |
| **smtp4dev** | 与 Mailpit 类似，支持跨平台 |
| **Postfix + Dovecot** | 生产级 SMTP + IMAP，较重但功能完整 |
| **Maildrop** | 极简的本地投递 agent |

---

## Mailpit

一个面向开发和测试的轻量 SMTP 捕获工具，以单个二进制文件分发。

### 它是什么

- 在 `localhost:1025` 接受 SMTP 连接
- 捕获所有邮件，除非明确配置，否则不会投递出去
- 在 `localhost:8025` 提供 Web UI，并提供用于集成测试的 REST API
- 还提供可选的 POP3 服务器

### 发送／中继模式

| 模式 | 行为 |
| --- | --- |
| 默认 | 捕获邮件，不向任何地方发送 |
| SMTP Relay（手动） | 捕获邮件，再通过 Web UI 手动“释放”到真实 SMTP 服务器 |
| Relay All | 捕获邮件，并通过真实 SMTP 服务器自动转发所有邮件 |
| SMTP Forwarding | 捕获邮件，并自动向固定地址发送副本 |

中继需要配置文件：

```yaml
host: smtp.gmail.com
port: 587
starttls: true
auth: plain
username: you@gmail.com
password: your-app-password
```

### Mailpit 不支持什么

- **多个邮箱**：无论收件人是谁，捕获的所有邮件都进入同一个共享收件箱。这个功能曾有人提出，但已被以“不计划支持”关闭。绕行办法是，在不同端口运行多个实例。
- **获取外部邮件**：Mailpit 没有 IMAP 客户端，无法连接 Gmail 或任何外部服务器，只接收直接发给它的邮件。

### Mailpit 不是邮件客户端

它不能用来读取真实收件箱（Gmail、Outlook 等）。要做这些，你需要：

- 真正的 IMAP 客户端库（`imaplib`、`imapflow`）
- 或桌面客户端（Thunderbird、Spark 等）
- 或终端客户端（aerc、neomutt）
- 或同步工具（`mbsync`、`offlineimap`），把邮件拉到本地 Maildir
