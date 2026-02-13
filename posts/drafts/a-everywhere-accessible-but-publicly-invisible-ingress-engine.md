---
draft: true

title: A Everywhere-Accessible but Publicly Invisible Ingress Engine
date: 2026-02-08
tags: []
eleventyNavigation:
  key: a-everywhere-accessible-but-publicly-invisible-ingress-engine
---

> TODO! NICHOLAS FIX THE TODOS

Most personal projects and homelab services don’t need to be public, but they do need to be reachable. I want to access my dev tools, internal dashboards, and side projects from anywhere, on any of my own devices, without opening ports, exposing IPs, or worrying about who might stumble across them on the internet.

This post walks through how I built an everywhere-accessible but publicly invisible ingress engine using Tailscale, Docker, Caddy, and DNS rewrites. The result is a private, domain-based setup that behaves like a small cloud. It has HTTPS, clean hostnames, and reverse proxying, but is only accessible to me, lives on my own machine, and never touches the public internet.

[[toc]]

---

Before going any further, it’s worth addressing the obvious question.

## Why not just use `tailscale serve`?

> It does not scale for me.

I know about it. I use it. And honestly, it’s kind of magical.

You can run:

```bash
tailscale serve --https=8080 http://localhost:8080
```

and immediately access that service from another device in the same tailnet via:

```
https://device.your-tailnet.ts.net:8080/
```

For quick experiments or one-off services, this is fantastic.

That said, there are a few things I don’t love about relying on it as my primary setup:

1. I have to remember to run the command
2. I have to remember which port maps to which service
3. ["I only get one domain per device and I cannot use subdomains" - Gabriel Garrido](https://garrido.io/notes/tailscale-nextdns-custom-domains/#:~:text=I%20only%20get%20one%20domain%20per%20device%20and%20I%20cannot%20use%20subdomains)

This becomes a real problem once you scale beyond a single service.

I’m running multiple websites and tools, including my [resume project](https://github.com/TheClooneyCollection/project-resume), my [blog](https://github.com/NicholasClooney/blog.clooney.io), and its template project, [11ty-subspace-builder](https://github.com/TheClooneyCollection/11ty-subspace-builder). Each of these has both a `dev` and a `prod` version. Very quickly, I’m dealing with a growing list of ports, mental bookkeeping, and a setup that only exists in my head.

What I really want is a system. I want every service to have a stable, human-readable address (e.g. `dev.resume.clooney.io`) that I can just type into a browser. No remembering commands. No remembering ports.

But doing that usually means exposing services publicly, and that’s not something I’m excited about either.

That trade-off pushed me to build a private ingress engine that only my devices can access, remains invisible to the public internet, and still behaves like a real web setup with domains and HTTPS.

## A bit of background: Containerization

> I also don't want to run Tailscale as sidecar containers for each and every service I am running.

Most of these personal projects are Eleventy sites. I enjoy working on them, iterating quickly, and running them locally. Recently, I moved from running these projects directly on my machine to running them inside Docker containers. That shift gave me better isolation and consistency, but it also made access patterns more important.

At that point, there were multiple valid directions I could have taken. I could have exposed ports on the host and used `tailscale serve` locally. I could have run Tailscale as a sidecar container alongside each service. Both approaches work, and both are reasonable.

What I didn’t want, though, was to end up with multiple Tailscale instances or containers per service. Conceptually, I wanted a single node to represent “the gateway to my locally running services on my machine" to the rest of my tailnet. One entry point. One place where traffic enters the system.

From there, everything else should behave like normal internal infrastructure: services talk to each other over a shared Docker network, routing is handled in one place, and individual apps don’t need to know anything about Tailscale at all.

## Inspiration and approach

I was lucky to come across this post by Gabriel Garrido:  
[Running private services with Tailscale and a custom domain](https://garrido.io/notes/tailscale-nextdns-custom-domains/)

My overall approach is very similar to his post, at least conceptually. Tailscale for the private VPN, Caddy for reverse proxying and issuing HTTPS certificates via my domain provider, and NextDNS for DNS rewrites.

The main difference is in how everything is deployed and some minor implementation details.

In my setup, everything runs in Docker. Tailscale runs in Docker (though it's just one instance). Caddy runs in Docker. All my services run in Docker. And yes, I really do mean everything.

> TODO! maybe add a screenshot of dockhand

On top of that, I managed to eliminate local host port mappings entirely by using a shared network interface across these containers. No exposed ports on the host, no loose ends.

Why go this far? Because I love it being tidy. No extra surface area, no unnecessary plumbing, and a setup where every piece has a clear role and place.

## The Devil is in the Details 

One important note before getting into implementation: this pattern is not locked to Tailscale, Caddy, or NextDNS specifically. Those are just the tools I chose. You can swap any layer for an equivalent (private network, reverse proxy, DNS rewrite provider) and keep the same overall architecture.

> TODO
> - [ ] create example repo
> - [ ] Link to my example repo with compose.yml, caddyfile, and dockerfile.caddy
> - [ ] Add architecture diagram (request flow: device -> tailscale -> caddy -> service)
> - [ ] Add a "quick start" section with copy/paste commands
> - [ ] Add security notes (ACLs, key rotation, token storage)


### The Shared Docker Network Interface

Before this, I didn't know you can split the docker compose file into multiple ones and combine them and you can do `docker comopse -f compose.yml -f compose.shared-network.yml up`

It really helps in the cases where all my services are public repos and this shared network setup with no host port mapping is just for me. So I can keep a default `compose.yml` with the default network interface and the host port mapping, while the `compose.shared-network.yml` to clear / reset the port mapping and add in the external edge interface. (I don't want anyone running docker with my projects to needing to do anything they shouldn't need to for my own sake.)

### Tailscale & Caddy

caddy attaches to the tailscale network interface

> TODO
> - [ ] Add compose snippet showing `network_mode: "service:tailscale"` for caddy
> - [ ] Add note on why this removes host port exposure

### Caddy

- domain api token
- maps all containerized services using `service-alias:port`.
- only accepts either tailnet ip range or 127.0.0.1 (i think with my setup, it's only 127.0.0.1 since it shares the same network interface as tailscale)

> TODO
> - [ ] Add full example Caddyfile with one dev and one prod route
> - [ ] Clarify token scope required at domain provider

### NextDNS + Tailscale

NextDNS for rewriting dns and using Tailscale DNS to use next dns as the "source" for all my devices in my tailnet.

> TODO
> - [ ] Add one concrete rewrite example (`dev.resume.clooney.io` -> tailnet target)
> - [ ] Add troubleshooting checklist for DNS propagation and cache flush

## FAQ

### Tailscale

**Q: Auth key vs OAuth client/token in Tailscale. What should I use?**  
A: Use an auth key when a node just needs to join your tailnet (common for a single machine or container). Use OAuth when you are building automation that calls the Tailscale API. They solve different problems: node enrollment vs API access.

**Q: Can an auth key expire in one day?**  
A: Yes. You can create short-lived auth keys (including one day) for safer enrollment.

**Q: Is a Tailscale auth key one-time use?**  
A: It can be, and for this kind of setup that is usually preferred. A one-off auth key is consumed when the device successfully authenticates, then it is automatically invalidated for future enrollments.

**Q: Why not use a reusable auth key here?**  
A: In this setup, we only need to authenticate one ingress container, so reusable keys add risk without adding value. A one-use key matches the use case and minimizes blast radius if the key is ever exposed.

**Q: Is auth key expiry the same as node key/token expiry? Will my machine get kicked out when the auth key expires?**  
A: No, they are different lifecycles. Auth key expiry only affects *new login/enrollment* with that key. An already-authenticated machine keeps working and rotates its own node keys normally, so it is not kicked out just because the original auth key expired.

**Q: Should this ingress node be ephemeral?**  
A: Not for this setup. Ephemeral nodes are meant for short-lived workloads and are automatically removed when they disconnect. For a stable ingress node, use a regular (non-ephemeral) node so it persists in your Tailscale device list and keeps a consistent identity.

**Q: What happens if I recreate the Tailscale container? Does it break?**  
A: Not if you persist Tailscale state on the host. In this setup, the node identity survives container recreation because state is stored outside the container filesystem.

### Docker / Compose

**Q: Why split compose files instead of one big file?**  
A: It keeps the public/default setup clean for everyone, while your private overlay (`compose.shared-network.yml`) can remove host port mappings and attach services to your private edge pattern.

**Q: Why no host port mappings?**  
A: Fewer exposed surfaces on the host and one controlled ingress path through Tailscale + Caddy.

### Caddy

**Q: Why use Caddy if Tailscale already gives access?**  
A: Caddy gives stable hostnames, centralized routing, and automatic HTTPS behavior across many services so you don't manage per-service commands/ports.

**Q: What does Caddy proxy to in this setup?**  
A: Internal Docker DNS names (for example, `resume-dev:8080`) over the shared network.

**Q: What happens if I recreate the Caddy container?**  
A: Routing config is easy to restore from your files, but Caddy still needs access to the DNS provider API token to manage certificates. Make sure that token is provided again via your environment/secret setup.

**Q: How often should I rotate the DNS API token?**  
A: Rotate it on a regular schedule and immediately after any possible leak. A practical baseline is every 60 to 90 days, plus emergency rotation when credentials are exposed.

**Q: What minimum DNS API token permissions should Caddy have?**  
A: Grant only the smallest set needed for DNS challenge updates on the specific zone(s) you use. Avoid account-wide or unrelated permissions; zone-scoped DNS record edit/read is usually the right target.

### NextDNS + DNS rewrites

**Q: Why use DNS rewrites here?**  
A: Rewrites let you type human domains while still resolving to private tailnet-reachable targets.

**Q: Why combine NextDNS with Tailscale DNS?**  
A: Tailscale can distribute DNS settings to your tailnet devices, and NextDNS provides the custom rewrite behavior, so every device gets the same private naming experience.
