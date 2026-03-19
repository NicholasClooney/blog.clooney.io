---
title: "A Short Guide to Tailscale: Secure Networking Made Simple"
date: 2025-10-01
eleventyNavigation:
  key: tailscale-starter-guide
tags:
  - tailscale
  - networking
  - private-network
  - security
  - infra
  - devops
---

Over the past few weeks, I’ve spent quite a bit of time experimenting with **Tailscale**, and it has quickly become one of my favorite tools.

If you haven’t heard of it, [Tailscale](https://tailscale.com/) is a secure, easy-to-use mesh VPN built on WireGuard. It lets your devices talk to each other as if they were on the same local network, no matter where in the world they are.

I originally wrote about my broader Tailscale journey in previous blog posts ([Coding on iPhone Anywhere](/posts/ssh-from-iPhone-to-Mac/), [Network Debugging Deep Dive](/posts/networking-deep-dive)), but this time I want to focus on something more concrete: a **starter guide** mixed with a few **real-world examples** of how I personally use it, from helping my family in China to keeping my own services private.

Before diving in: the concepts here aren’t complicated, but they do build on each other. I’ll explain the key ideas as we go.

---

[[toc]]

## Why Tailscale?

For most people, a VPN means either the clunky corporate tool you log into for work, or a consumer VPN app that promises “privacy” while routing all your traffic through someone else’s servers. Both feel like a black box. You don’t really know what’s happening behind the scenes.

Tailscale is **different**. It gives you your own secure private network and **complete control**. Just install the app, log in with an account (Google, Apple, GitHub, etc.), and suddenly all your devices can see each other as if they were side by side.

### How it actually works (briefly)

Under the hood, Tailscale uses [WireGuard](https://www.wireguard.com/), a modern, lean VPN protocol known for being both fast and cryptographically sound. But WireGuard alone requires manual key exchange and configuration for every pair of devices. Tailscale handles all of that automatically using a **control plane**: a coordination server that manages key distribution and peer discovery.

The result is a **mesh network**. Rather than all traffic funneling through a central server (like a traditional hub-and-spoke VPN), your devices connect **directly to each other** peer-to-peer. This keeps latency low. Traffic takes the most direct route it can.

When a direct connection isn’t possible (e.g., both devices are behind strict NAT), Tailscale falls back to relaying traffic through its [DERP](https://pkg.go.dev/tailscale.com/derp) servers. You won’t notice the difference; it just works.

Each device gets a stable **100.x.x.x** address (from the CGNAT range) assigned by Tailscale. These addresses never change, so even if your laptop switches networks, its Tailscale IP stays the same.

Here’s why I love it:

* **Simple setup**: No port forwarding, no firewall rules, no static IPs.
* **Security baked in**: WireGuard’s cryptography with identity-based authentication tied to your login provider.
* **Cross-platform**: Works on macOS, iOS, Linux, Windows, Android, even routers and Raspberry Pis.
* **Feels like one network**: With MagicDNS (enabled by default), you connect to devices by name instead of memorizing IPs. `ssh macbook-pro` just works.

And here’s the powerful part:

* You can access your laptop from anywhere in the world as though it’s on the same Wi-Fi.
* You can set an **exit node** to route all your internet traffic through another device, useful for bypassing firewalls, avoiding geo-restrictions, or browsing as if you’re back home.
* You can run private services safely without ever exposing them to the public internet.

---

## Getting Started

If you’re new to Tailscale, here’s the fastest way to dive in:

1. **Sign up** at [tailscale.com](https://tailscale.com/) with your preferred login (Google, Apple, GitHub, Microsoft, etc.).
2. **Install Tailscale** on your devices: laptops, phones, servers.
3. **Log in on each device**, and they appear in your personal **tailnet** (Tailscale’s name for your private network).
4. **Test it out**: SSH into another machine using its hostname, or open a private service through its Tailscale IP.

That’s it. No firewall rules. No public IP headaches. Just devices talking directly and securely.

### On macOS or Linux

On macOS, Tailscale is a menu bar app. Once installed, clicking it shows you all connected devices and their Tailscale IPs.

For Linux servers (or a headless Raspberry Pi), the CLI is your friend:

```bash
# Install on Debian/Ubuntu
curl -fsSL https://tailscale.com/install.sh | sh

# Start the Tailscale daemon
sudo tailscaled

# Bring it up and authenticate
sudo tailscale up

# Check status and see all peers
tailscale status
```

After `tailscale up`, you’ll see a URL to open in a browser for authentication. Once done, the device is part of your tailnet.

### The Tailscale admin console

The [admin console](https://login.tailscale.com/admin/machines) is where you manage everything:

* **Machines**: see all your devices, their IPs, OS, and last-seen time.
* **DNS**: configure MagicDNS and custom nameservers.
* **ACLs**: control which devices can talk to which (more on this below).
* **Exit nodes**: approve devices to act as internet gateways.

It’s surprisingly clean. Getting to grips with it early makes the more advanced features much easier to use.

---

## Real-World Examples of Tailscale in Action

### Helping Family Across the Great Firewall

One of the most meaningful use cases for me has been setting up Tailscale for my family in China. The Great Firewall makes most VPN solutions unreliable or overly technical to configure. Tailscale’s approach is different. Because the connection is peer-to-peer and the traffic looks like standard WireGuard UDP, it’s far more resilient than many alternatives.

The setup process for them was simple: install the app, log in with a shared account I created, and they were on my tailnet. I then set my Mac at home as an **exit node**, so when they enable it, all their internet traffic routes through my machine and out through my home internet connection.

To configure an exit node on Linux:

```bash
sudo tailscale up --advertise-exit-node
```

Then in the admin console, approve the exit node under the machine settings. On their end, they just pick it from the Tailscale app. No terminal required.

I love the moment when they realized how **easy** it is and how **powerful** it is to get a free and open internet with that **little effort**. That’s a feeling worth optimizing for.

### My Own Private Remote Terminal (Without Exposing SSH)

Tailscale also powers my own workflow. Whether I’m hopping between my MacBook Air and MacBook Pro, or connecting into a Linux server, it acts as my **secure remote terminal solution**. It feels like SSH over a local network, even if I’m halfway across the world.

The key detail: **I don’t expose SSH port 22 to the internet at all.** The server’s firewall blocks all inbound connections from the public internet. SSH only works over the Tailscale interface.

```bash
# SSH by hostname, not IP - MagicDNS resolves it
ssh debian-server

# Or use Tailscale SSH, which handles auth too
tailscale ssh debian-server
```

[Tailscale SSH](https://tailscale.com/kb/1193/tailscale-ssh) is worth highlighting separately. It’s a completely different mechanism from regular SSH over a Tailscale connection. Rather than running your system’s SSH daemon and connecting to it over the Tailscale network, Tailscale SSH replaces the SSH server entirely. Authentication is handled by Tailscale itself using the device’s identity. No keys to generate, no `authorized_keys` to manage.

To enable it on the server side, pass `--ssh` when bringing Tailscale up:

```bash
sudo tailscale up --ssh
```

That’s all it takes. From any other device on your tailnet, `tailscale ssh debian-server` connects directly, authenticated by your Tailscale identity. I use it for quick access to machines where I haven’t bothered with traditional key setup. It’s one less thing to manage.

### Secure Access to My Own Services

I run a few private services: a preview build of this blog on my MacBook Pro, an analytics dashboard on a VPS, and a couple of other internal tools. Instead of exposing them to the public internet, I keep them locked down behind Tailscale.

In practice: the services listen on `0.0.0.0` (or the Tailscale interface specifically), but the machine’s firewall only allows inbound connections from the Tailscale CGNAT range (`100.64.0.0/10`). Nothing is publicly reachable.

```bash
# Example: lock a service to Tailscale only with ufw
sudo ufw allow in on tailscale0
sudo ufw deny 3000  # deny the port publicly
```

That way, they’re only accessible to me, or whoever I explicitly add to my tailnet. It’s the cleanest way I’ve found to run personal services without managing certificates, nginx auth proxies, or IP allowlists.

---

## Tips and Extras

Once you’re comfortable with the basics, there are some great extras worth exploring:

### Subnet Routers

An exit node routes *all* your traffic through another device. A **subnet router** is more surgical. It advertises a specific local network range to your tailnet, so other devices can reach machines on that subnet without installing Tailscale on every one of them.

This is great for home labs. If your router or a Raspberry Pi runs Tailscale and advertises `192.168.1.0/24`, you can SSH into any device on that local network from anywhere, even if those devices don’t have Tailscale installed.

```bash
sudo tailscale up --advertise-routes=192.168.1.0/24
```

Approve it in the admin console and enable IP forwarding on the device, and you’re done.

### ACLs (Access Control Lists)

By default, all devices on your tailnet can reach each other. That’s fine for personal use, but if you start sharing access with others, ACLs let you define exactly who can connect to what.

The policy is written in a simple JSON-like format in the admin console. For example, you can say "only my personal devices can reach the media server" while a family member’s device can only use the exit node.

### Tailscale Funnel

[Funnel](https://tailscale.com/kb/1223/tailscale-funnel) is a newer feature that lets you expose a local service to the **public internet** through Tailscale’s infrastructure, without any port forwarding or public IP. It’s the opposite of what I normally use Tailscale for, but incredibly useful for sharing a local dev server temporarily.

```bash
tailscale funnel 3000
```

That’s it. Tailscale gives you a public HTTPS URL pointing at your local port 3000.

### Tailscale Send

Transfer files directly between devices without any setup:

```bash
tailscale file cp some-file.txt macbook-pro:
```

The recipient picks it up from the Tailscale app. No cloud storage, no shared drives. Just a direct peer-to-peer transfer.

### Sharing Devices

You can share individual devices with people outside your tailnet (a friend, a contractor, a family member) without giving them full access to everything. They accept the share via a link and see only that one device in their Tailscale app. It’s a clean way to give limited access without the overhead of managing a full shared network.

---

## One Caveat: the Control Plane

It’s worth being transparent about one trade-off: while the data plane (actual traffic) is peer-to-peer and encrypted end-to-end, the **control plane runs on Tailscale’s servers**. Tailscale coordinates key exchange and device discovery. This means you’re trusting Tailscale as a company not to misuse that coordination role.

For most personal and professional use cases, this is a completely reasonable trade-off, and Tailscale has published a [detailed security model](https://tailscale.com/security) explaining exactly what they can and cannot see. If you need fully self-hosted coordination, they also have an open-source control server called [Headscale](https://github.com/juanfont/headscale), though that comes with its own operational overhead.

### Tailscale Lock

If the control plane trust concern does bother you, there’s a built-in answer: **Tailscale Lock** (also called `tailnet lock`).

Normally, Tailscale’s coordination server decides which devices are authorized to join your tailnet. With Tailscale Lock enabled, that’s no longer enough. Every new node must be **cryptographically signed** by a trusted key before other devices will accept it, even if Tailscale’s servers say it’s legitimate.

This means that even if Tailscale’s control plane were somehow compromised, an attacker couldn’t silently add a rogue device to your network. Your existing trusted nodes hold the signing authority.

```bash
# Initialize Tailscale Lock - generates a signing key on this device
tailscale lock init

# Sign a new node before it can join
tailscale lock sign <node-key>

# Check current lock status
tailscale lock status
```

It’s an advanced feature and adds operational overhead. You need a trusted device online to sign new nodes. But if you’re running anything sensitive behind your tailnet, it’s a meaningful extra layer of assurance that sits entirely outside Tailscale’s control.

---

## Closing Thoughts

For me, Tailscale isn’t just another networking tool. It’s a **solution I enjoy using**: simple, secure, and quietly powerful. Whether I’m helping my family stay connected, accessing my own servers, or keeping services private, it’s become part of my daily workflow.

What I appreciate most is how incrementally it reveals its power. You can start with just two devices talking to each other and grow into exit nodes, subnet routers, ACLs, and Funnel, without ever needing to tear anything down and start over. Good tools feel like that.

If you’ve ever felt frustrated by traditional VPNs, I highly recommend giving Tailscale a try. And if you’re curious about the longer story of how I got here, check out my earlier posts ([Coding on iPhone Anywhere](/posts/ssh-from-iPhone-to-Mac/), [Network Debugging Deep Dive](/posts/networking-deep-dive)).

---

*Have you used Tailscale in your own setup? I’d love to hear how, especially any creative uses I haven’t thought of.*
