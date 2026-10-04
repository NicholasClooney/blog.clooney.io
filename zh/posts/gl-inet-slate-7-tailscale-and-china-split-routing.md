---
title: "GL.iNet Slate 7、Tailscale 与防火长城环境下的分流"
date: 2026-07-14
time: "14:54"
tags:
  - networking
  - tailscale
  - china
  - gfw
  - glinet
  - openwrt
  - pbr
  - dnsmasq
  - nftables
  - infra
excerpt: "完整记录我在中国使用的路由器级配置：GL.iNet Slate 7 默认通过 Tailscale 连接 Debian VPS 出口节点，策略路由让国内流量直连，DNS 分流兼顾国内外服务速度。也记录三个最费时间的坑：tailscale0 的 LAN 转发与 MASQUERADE、PBR 与 Tailscale 的优先级，以及 GL.iNet 的 0x8000 标记泄漏。"
---

我回中国探亲几周，想找回自由上网的感觉。这基本就是写这篇的全部动机。生活在防火长城后面，归根结底是一个伪装起来的路由问题。你希望默认能访问开放互联网，又希望淘宝、微信和银行服务保持快速，还希望接上酒店网线，或中继别人家的 Wi-Fi 后，它仍能继续工作。很长一段时间，我在 Apple 设备上用 [Quantumult X](https://quantumult.app/x/)，配合 Debian VPS 上的 [v2ray](https://www.v2fly.org/en_US/) vmess 代理，逐设备解决。手机和笔记本用得很好，但对 Switch、电视、Apple TV 或我妻子的 Windows 电脑毫无帮助。

解决办法是把分流下移到网络本身：用一台 [GL.iNet Slate 7](https://www.gl-inet.com/products/gl-be3600/)，默认经 Tailscale 连接同一台 Debian VPS，VPS 现在也兼任 Tailscale 出口节点，再用[策略路由](https://openwrt.org/docs/guide-user/network/routing/pbr)让国内目标直接走物理上行链路。这并不是即插即用。中间经历了好几轮调试，趁记忆还新鲜，我想记下来。

---

[[toc]]

## 快速概览

- **VPS**：中国境外的 Debian 服务器，同时运行 v2ray/vmess 代理，供 iOS 和 macOS 上的 Quantumult X 使用，以及 Tailscale 出口节点。一台服务器，两种入口。
- **路由器**：基于 OpenWrt 的 GL.iNet Slate 7，运行原生 Tailscale 客户端，把 VPS 设为出口节点。
- **路由分流**：发往中国 IPv4 目标的流量打上 fwmark，直接从当前物理上行出口发出。中继模式用 `sta0`，有线模式用 `wan`。其他流量落到 Tailscale，经出口节点转发。
- **DNS 分流**：国内域名通过 AliDNS（`223.5.5.5`）直连解析；其余域名通过 stubby 的 DoT 查询 Cloudflare，而这部分流量本身也走出口节点，ISP 的 DNS 污染就碰不到它。
- **三个坑**：都没有在显眼的文档里说明，任何一个都可能悄悄让 LAN 客户端失效，而路由器自己仍然正常。
  - `tailscale0` 防火墙区域必须启用 MASQUERADE，并添加 `lan -> tailscale0` 转发条目，LAN 流量才能从这里出去。
  - Tailscale 的出口节点 IP 规则默认优先于 PBR，因此所有数据包都会进隧道，包括标记为直连的包。
  - GL.iNet 的 `vpn_table` 会给每个未标记的 LAN 包打上 fwmark `0x8000`，与提前匹配这个标记的 PBR 规则冲突。

## 整体背景

加入路由器之前，同一台 VPS 承载的是两套独立用途：

1. **v2ray + vmess**，做按应用代理。iOS 和 macOS 上的 Quantumult X 指向 VPS，通过规则集只转发境外流量，国内流量直连。
2. **Tailscale**，私密组网访问家里的服务，比如 Pi-hole、开发机器和自托管服务。起初没有出口节点，只有节点互联。

客户端能安装 Quantumult X 时，它很好用；不能安装的设备就用不上。所以 Slate 7 成了“其他所有设备”的解决方案：只要连上它提供的局域网，就能得到境外畅通、国内快速的体验，不需要任何客户端软件。

Slate 7 自带 Tailscale 客户端，这是它能成为候选的原因。启用并指向出口节点很简单，后面的事情就不简单了。

## 高层架构

```
                            +--------------------------------------+
                            |          Debian VPS (foreign)        |
                            |  * v2ray/vmess (Quantumult X clients)|
                            |  * Tailscale exit node "debian"      |
                            +------------------^-------------------+
                                               | WireGuard (Tailscale)
                                               |
                            +------------------+-------------------+
                            |         GL.iNet Slate 7 (OpenWrt)    |
                            |                                      |
   iPhone (QuantumultX) --> |  * dnsmasq split: CN -> AliDNS       |
                            |    other -> stubby -> Cloudflare     |
   LAN clients ---------->  |  * PBR: CN CIDRs -> direct uplink    |
                            |    everything else -> tailscale0     |
                            |  * firewall: lan -> tailscale0 +     |
                            |    MASQUERADE on tailscale0 zone     |
                            +----------^--------------------^------+
                                       | sta0 (repeater)    |
                                       | or wan (ethernet)  |
                                       v                    |
                            +----------+-----------+   Chinese ISP
                            | Local Chinese uplink |   (direct for CN,
                            +----------------------+    tunneled for
                                                        everything else)
```

重点是：从路由器角度看，默认路由归 Tailscale 所有，PBR 则从这个默认行为中*减去*例外，把国内目标提前转回物理上行出口。Tailscale 负责默认路径、PBR 负责例外，这正是整个 [china-list 生态](https://github.com/felixonmars/dnsmasq-china-list)围绕的模式，也是故障时最温和的形态：未知域名仍会走隧道，仍能工作，可能只是慢一点。

## 三个支柱

### 1. 路由器上的 Tailscale 作为默认路由

这里没有什么特殊操作。启用出口节点，允许访问 LAN，然后还有一个重要参数：不要让 Tailscale 改写路由器的 DNS。dnsmasq 分流需要继续掌握解析权。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=02-tailscale-exit-node.sh" %}

底部的 `sleep 180 && tailscale set --exit-node=` 是我的保险措施。每次在中国通过 SSH 测试出口节点变更时，我都会先安排它执行。如果出口节点变更弄坏了路由，剧透一下，第一次确实如此，路由器会在三分钟后自动回滚，我就不会失去访问。

### 2. 通过 PBR + fwmark 做国内分流

实际工作由 [PBR 软件包](https://openwrt.org/docs/guide-user/network/routing/pbr)完成。一个部署在 `/usr/share/pbr/pbr.user.china` 的自定义用户脚本，会在每次 PBR 重新加载时做四件事：

1. 从 `https://ispip.clang.cn/all_cn_ipv46.txt` 下载中国 IPv4 CIDR 列表。
2. 从 `wan`、`secondwan`、`wwan`、`tethering` 中动态选择当前直连上行接口。明确忽略隧道设备（`tailscale*`、`wg*`、`tun*`、`ppp*`），避免误把隧道选成“直连”路径。
3. 把 CIDR 加入所选 PBR nftables 集合。中继模式下，国内流量得到 fwmark `0x30000`，进入 `pbr_wwan`；有线 WAN 模式下，得到 `0x10000`，进入 `pbr_wan`。
4. 添加对应的 `pbr_output` 规则，让路由器自身产生的流量，比如路由器发出的 ping、stubby 的 DNS 流量，也得到正确标记。没有它，分流只对转发的 LAN 流量生效。

### 3. 通过 dnsmasq 做 DNS 分流

DNS 分流是保证国内访问速度的另一半。国内 CDN 和有地域限制的服务，*只有*在面向中国的 DNS 上解析时，才会返回附近接入点的 IP。向 `1.1.1.1` 查询 `taobao.com`，拿到的是离 Cloudflare 近的接入点，不一定离你近。问 `223.5.5.5`，才会得到合适的答案。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=06-dnsmasq-china-split.conf" %}

后缀列表来自外部维护的 [felixonmars/dnsmasq-china-list](https://github.com/felixonmars/dnsmasq-china-list)，大约包含 11.1 万行 `server=`。AliDNS 的 `223.5.5.5` 本身就在中国 CIDR 集合里，因此在 output 阶段会打上 PBR 标记 `0x30000`，直接出去，无需额外规则。未命中 china-list 的查询会落到 stubby（`127.0.0.1#5453`），由它通过 DoT 与 Cloudflare 通信，其上游流量走 Tailscale 出口节点。

一个小运维细节：`dnsmasq reload` 发的是 `SIGHUP`，不会重新解析 `conf-dir`。要让 `accelerated-domains.china.conf` 的改动生效，需要执行 `/etc/init.d/dnsmasq restart`，重新解析全部 11.1 万行要三到五秒。这段时间 DNS 会中断，挑方便的时候做。

## 坑 1：LAN 到 tailscale0 需要显式转发，也需要 MASQUERADE

第一个会悄悄弄坏 LAN 客户端的地方，是出口节点的防火墙配置。在路由器上启用 Tailscale 并设置出口节点，足以让*路由器自身*从隧道出去，却不足以让 LAN 客户端也这样走。默认还缺两部分：

1. 允许 `lan -> tailscale0` 的防火墙转发条目。没有它，数据包还没到路由决策就被拒绝了。
2. `tailscale0` 区域上的 MASQUERADE。没有它，包确实从 `tailscale0` 路由出去，但源 IP 仍是 LAN 客户端的 `192.168.8.x`，没有转换。出口节点把返回包送回 tailnet，tailnet 不认识 `192.168.8.x`，连接就断了。

缺少 MASQUERADE 最让我困惑，因为数据包确实*离开*了路由器，`tailscale0` 上的 `tcpdump` 能看到它们发出去，只是再也没回来。看起来像境外端的问题，实际上是 NAT 的问题。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=03-lan-tailscale0-firewall.sh" %}

GL.iNet 的 Tailscale 软件包通常已经创建了 `tailscale0` 区域。缺的是一个 NAT 条目，设置 `target='MASQUERADE'` 和 `src='tailscale0'`。把它与转发条目一起添加，再重新加载防火墙，LAN 流量终于能完整穿过隧道。

## 坑 2：PBR 与 Tailscale 的优先级

第一次启用出口节点时，行为与文档描述一致：它在 `tailscale0` 上添加了默认路由。但也彻底弄坏了国内分流，所有包，无论国内还是境外，都去了 `tailscale0`。

原因在于 Tailscale 注册默认路由的方式。它不改 `main` 表，而是在表 52 中安装 `default dev tailscale0`，并添加优先级为 `5270` 的 IP 规则，含义是“所有流量都查表 52”。PBR 自己按接口分表的规则，优先级在 `30000` 及以上。`5270` 比 `30000` 小得多，所以 Tailscale 先匹配。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=01-ip-rule-ordering.txt" %}

修复办法是在优先级 `5261-5263` 安装 PBR 规则的提前副本，排在 Tailscale 的 `5270` 之前。PBR 标记为国内的包，也就是 fwmark 为 `0x10000` 或 `0x30000` 的包，会先命中提前规则，进入 `pbr_wan` / `pbr_wwan`，从物理上行出去。未标记的包继续落到 `5270`，走 Tailscale。`pbr.user.china` 在每次 PBR 重载时重新安装这些规则，因此执行 `service pbr reload` 或重启后也能保留。

同一次调查还发现第二个缺口：最初的国内 PBR 配置只填充 `pbr_prerouting`，它处理的是转发流量。路由器自身流量，比如 shell 发出的 ping、stubby 的 DoT 连接，也需要对应的 `pbr_output` 规则才能打标。这就是脚本同时安装两种规则的原因。

## 坑 3：GL.iNet 的 0x8000 标记泄漏

修好 PBR 优先级后，LAN 客户端访问国内网站完全正常，但 Google、YouTube、Discord 的 TCP SYN 一直卡住。路由器自己 curl 相同域名，两秒就得到 200。路由器正常，LAN 不行。

`conntrack -L` 立刻说明了问题。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=05-conntrack-symptom.txt" %}

回复方向的 `dst=192.168.0.109` 是路由器的 `sta0`，也就是物理上行 IP，而不是 tailnet IP `100.106.152.123`。这意味着 LAN 数据包经 `sta0` 做了 MASQUERADE，而不是 `tailscale0`。国内 ISP 丢弃或重置了返回流量，握手始终无法完成。DNS 看起来正常，因为 dnsmasq 转发给 stubby，而 stubby 自身流量正确地走出口节点。但真正发往 Google 的 TCP 流，却从物理上行漏出去了。

罪魁祸首是 GL.iNet 的 `vpn_table` nftables 链。每个未标记的 LAN 包都会被打上 fwmark `0x8000`。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=04-vpn-table-0x8000-mark.nft" %}

与此同时，我的 `pbr.user.china` 脚本一直在安装一条优先级为 `5260` 的提前 IP 规则：

```
5260: from all fwmark 0x8000/0xf000 lookup main
```

这条规则来自较早一次迭代，当时我想保留 GL.iNet 对 `0x8000` 包的“直连”意图。但现在 GL 会无条件给*所有* LAN 流量打这个标记。因此，pref `5260` 把每一个 LAN 包都劫到 `main` 表，也就是物理上行出口，Tailscale 的 pref `5270` 还没机会把它们路由到出口节点。

路由器自身不受影响，因为自身流量经过 `LOCAL_POLICY`，而不是 `ROUTE_POLICY`，`LOCAL_POLICY` 只给来自 `skgid 10000` 的包打标。这就是路由器 shell 中 `curl` 正常，而 LAN 笔记本上的 `curl` 不正常的原因。

修复办法：彻底停止安装 pref `5260`，并在每次脚本重载时显式删除残留副本，避免旧部署继续作祟。三个真正的 PBR 标记（`0x10000`、`0x20000`、`0x30000`）仍在 `5261-5263` 有提前规则，因此国内路由不受影响。现场执行 `ip rule del pref 5260` 验证后，LAN 上的 YouTube 立即加载了。

## 运维开关

我经常在有线与中继模式之间切换，从酒店到家里，再到咖啡馆，再回家，也会时不时离开中国。脚本会自动检测上行接口，所以能处理模式切换；但真正离开中国后，我希望关闭整套分流。境外网络不需要国内直连路径，china-list 也会增加不必要的 DNS 延迟。

{% github "https://gist.github.com/NicholasClooney/fb3fb65955b42fafd1da8e632d75678c/a8307add33669293fc7061214eedecab1831fe2f?file=07-pbr-toggle-runbook.sh" %}

底部的验证，是我每次改动后真正会运行的内容：先确认提前 PBR 规则还在，再检查 `1.1.1.1` 是否走 `tailscale0`，`223.5.5.5` 是否走物理上行。

## 只用允许名单怎么样？

隔一阵子就有人问，或我自己也会想：为什么不反过来，只让少数允许名单中的域名走隧道，其余全部直连？沿用同一套机制，技术上很直接：把 china 集合换成 `tunnel_set`，再对匹配取反（`ip daddr != @tunnel_set -> mark`）。Tailscale 继续掌握默认路由，PBR 只负责打标，其余保持不变。

但实际并不适合“生活在中国”的场景。整个分流生态，包括 Clash、sing-box、v2ray/Xray、Surge、Quantumult X，都默认采用“国内直连、境外代理”，是有原因的。china-list 虽然有约 11.1 万个后缀，却由外部维护，运维者不用费力。反向允许名单则包含长尾的境外 CDN、npm/pip 镜像、容器仓库、开发工具和各种 SaaS，都得自己永远维护下去。而且排除式模式的故障表现更温和：未知域名走隧道，仍能工作，可能慢一点；允许名单模式下，未知域名直接出去，悄悄失败或遭遇 DNS 污染。

允许名单模式确实有用，只是适用于不同场景：从*中国境外*经国内 VPS 访问限中国地区的服务、企业分流 VPN，或只让少数网站走隧道的隐私配置。这些都不是“突破防火长城”的用途。

## 稳定运行之后

最终，这台路由器已经把“出口节点 + 国内分流”作为常态运行了几周，覆盖中继与有线模式，LAN 客户端从 Apple TV、Windows 游戏本到 Switch 都有。境外流量通过 Tailscale 到 Debian VPS，回来时看起来就像来自 VPS 所在地。国内流量查询 AliDNS，拿到附近接入点，再走直连。两边都感觉不到什么特殊之处。

iPhone 和 MacBook 上仍保留 Quantumult X，想要时可以按应用控制：一份配置用于连着 Slate 7、网络已经替我分流的情况，另一份用于随便某个酒店 Wi-Fi，所有境外包都需要走 vmess 的情况。两种入口，一台 VPS，一张家用局域网，以及我一开始真正想要的那些平淡可靠的特性。
