---
author: Sathya Narayana Bhat
pubDatetime: 2026-09-18T05:00:00Z
modDatetime: 
title: I Chose the Hardest Possible Way to Run Jellyfin -- Part-1
slug: i-chose-the-hardest-possible-way-to-selfhosting-part-1
featured: true
draft: true
tags:
  - kubernetes
  - k3s
  - gitops
  - argocd
  - secrets
  - selfhosting
  - homelab
description:
  Why I put Kubernetes on an old laptop with a dying screen to run Jellyfin, and every way it fell over between kind and k3s.
---

I am writing this after the first night in ~6 months that nothing crashed and nothing went unreachable. The whole cluster is described in a Git repo now, every service is behind Traefik with real certificates, and I can rebuild the server from scratch if the disk dies. Mostly.

Getting there involved a lot of nights that were not like that. An early one went like: the `cloudflared` logs said connected. The Pods said running. Traefik said routing. The browser said nothing at all. Turns out everything was working as intended which also included the firewall which was just quietly dropping all incoming requests by default.

This is an ongoing journey, so I thought I would write it down as I go, partly as a record of how and why I got into self-hosting and Kubernetes, and partly in case it saves someone else a few hours. I have split this post into three parts: Why, What, and How.

 ![without further ado.](https://media1.tenor.com/m/6oRIXbXYO4MAAAAd/so-without-further-ado-lets-do-this.gif)

## Why? (The Motive)

### The Short Version: 
I have a Laptop with a dying screen, i wanted to ensure that i dont add to the e-waste bin just yet and these streaming services are and were annyoing to use with day on day more restrictions and cost hikes.

### The Longer Version: 
This can be divided into 4 parts:

#### **Cost and annoyance.** 
I was paying around ₹400 a month across a few services, and none of them could play the media I already owned. Worse, the ones I did pay for kept removing things. A show I was halfway through would vanish, I'd go hunting for wherever it had moved to, and the answer was usually another subscription. Pay, lose access, pay somewhere else, then the cycle continues again and again. 

Renting a VPS to run this instead would have put me right back where I started, a monthly bill in the same range as the subscriptions I was trying to cancel, Old hardware on the other hand just costs me electricity monthly.

#### **Learning by Doing** 
I Started my career as a pentester, i am used to breaking things and wanted to do something different, i wanted to create/build something for a change, so I started on Kubernetes, Git and CI/CD, and worked toward the CKA.

I don't retain anything I'm not actively using. Reading about Deployments and Services gets me to the end of the page and no further. So I do it backwards: pick something I actually want, write down what it has to do, and build until it does that. Jellyfin on my own hardware was the requirement. Everything else in this post is what it took to meet it, and every time I learned something new, it went straight into the cluster if it made the existing setup better.

#### **Security**
So far my career has been security engineering alongside a DevOps team, which means I've spent it on the reviewing side of the wall. I know what the failure looks like, telnet reachable from the internet, a web app happily serving over plaintext, a cert nobody renewed. What I'd never done is be the person who has to fix it, on a deadline, without breaking the thing that's already running.

That gap bothered me. It's easy to write a finding that says "enforce TLS on all endpoints" and never learn that the hard part isn't the enforcing, it's the renewal, the redirect chain, and the one internal service that breaks when you turn it on. I wanted to build the thing I usually audit, so that next time I can hand over a solution instead of a problem.

Also, bragging rights.

#### **Hardware**
The laptop is an HP Pavilion 15 Gaming that I got when I started college, 16 GB of RAM, a GTX 1050, a 2 TB WD Black SSD and a 1 TB HDD of unknown parentage. It was a pain in the ass for most of its life, but it was my pain in the ass, and when the screen started dying and I replaced it with a desktop, throwing it out felt wrong.

It also turned out to be a better fit for the job than I expected. I ignored the 1050 for Jellyfin and let it transcode on the integrated Intel GPU instead, Quick Sync handles everything I throw at it, it doesn't need a proprietary driver kept in lockstep with kernel updates, and it sips power on a machine that's on all day. That leaves the 1050 free for work that actually wants CUDA: Blender renders, or a small LLM I can point at from the rest of the cluster. Two GPUs, two jobs, neither fighting the other for a machine that's on 24/7 anyway. 16 GB is more RAM than a single-node k3s cluster serving video to one household will ever need.

So I turned it into a one-node cluster, set up so that adding a second node later would be a config change rather than a rebuild. The rest is this post.


### But this is a Docker Compose job right? 
#### Yes, Yes it is,
A docker-compose.yml with Jellyfin, a reverse proxy and a volume mount would have taken an evening, and it would still be running today without me thinking about it once
![alt text](https://media.tenor.com/kEEj3J50F6QAAAAi/so-why-derek-muller.gif)

The media server was the excuse, not the point. What I wanted was a machine where the answer to "what is running here" is a Git repo, not my memory of what I `docker run`-ed eight months ago. Every service declared, every change a commit, and a rebuild path that doesn't depend on me remembering anything.

That part worked. Six months in, I can hand you a repo URL and you can rebuild my server. Everything between here and there is the rest of this post.

## What? (The Stack)

Before the story of how it got this way, here's what's actually on the machine. I've laid it out in the order a request travels: from your browser, through the tunnel, to the container serving the video.

### Getting in from outside
I didn't want the hassle of opening router ports or paying for a static IP just to reach my apps from outside. So i used Cloudflare Tunnels (`cloudflared`) plus Traefik as a Gateway controller for the Kubernetes Gateway API.

`cloudflared` runs inside the cluster and dials *out* to Cloudflare, holding that connection open. When someone requests `jellyfin.homeserverfail.in`, Cloudflare accepts it at their edge and pushes it back down that connection. The traffic arrives as a reply to a request my own machine made, which every home router is happy to allow. (I run it as a StatefulSet; a Deployment works just as well, a leftover from my initial manifest.)

The catch is that this route is the ***only*** route. A laptop two metres from the server still round-trips to the nearest Cloudflare PoP, burning WAN latency and upstream bandwidth on every byte, the difference between instant playback and buffering for direct-play 1080p.

Ideally I'd point a DNS record on my router at the LoadBalancer IP, but mine doesn't support that. Instead, a wildcard `*.local.homeserverfail.in` in public DNS points at the server's LAN address, so in-network clients resolve straight to the box.

### Getting to the right place
Before starting let me start i should explain why gateway API instead of the trusty ol kubernetes ingress. Well simple answer the ease in shifing the controller when required. The only difference in both Gateway API and Ingress is that Gateway API is modular and allows in keeping every part of the traffic control in proper code.

There are two ways to do this. The simple one: point cloudflared straight at each application's service URL, e.g. jellyfin-service.jellyfin.svc.cluster.local, and call it a day. The other: point the tunnel at a gateway and let it do the routing. cloudflared preserves the original Host header, so a request for jellyfin.homeserverfail.in reaches Traefik with that hostname intact and the matching HTTPRoute picks it up. I add each hostname to the tunnel explicitly and send them all to the same gateway service, slightly more config than a catch-all, but nothing routes into the cluster unless I've listed it.

My initial manifests had no gateway or ingress controller; it seemed like maintenance I didn't need. What changed my mind was realising I had no control over traffic once it entered the cluster. If I want SSO in front of these apps, something has to sit between cloudflared and the service to enforce it, and with a direct tunnel-to-service mapping, there's nowhere to put it. 

So basically this is the flow of traffic for my services:

![alt text](<../../assets/images/Untitled Diagram.drawio(5).png>)

I do plan on implementing a service mesh too in the near future to secure inter deployment/pod networking, tho it has its additional benifits which i ll talk about later.

### What keeps it running

Before getting to where a request ends up, here's what everything sits on: the cluster itself, and the tools running in the background that handle the nitty gritty.

#### The cluster

I started on kind (Kubernetes IN Docker), where every node is just a Docker container that you label as a control plane or a worker. It felt closer to a real multi-node cluster than minikube, and setting up kubeadm looked daunting (P.S. it still does).

kind was never the problem for deploying things. It was the problem for running them. As soon as a few people were streaming at once, playback went ssslllooowww, and that was direct play, with no transcoding involved. Every stream took the scenic route: through Docker's networking, through bind mounts into a container pretending to be a node, and out through the tunnel. I never pinned down which layer hurt most. That's not really kind's fault. It's built for throwaway test clusters, and I was asking it to be a 24/7 media server.

So I did what any (in?)sane person would do and jumped to kubeadm... Nah, still daunting. I landed on K3s instead, a certified Kubernetes distribution that ships as a single binary. It comes with batteries included: Traefik, ServiceLB for LoadBalancer IPs, a local-path storage provisioner, and SQLite in place of etcd. Tho to be fair, I disabled the bundled Traefik (`--disable=traefik`). K3s installs it from its own manifests outside Argo CD, and I wanted the repo to be the end-all, be-all for redeployment, so Traefik gets deployed from Git like everything else.

A few things had to be wired up so the hardware from earlier was actually usable:

- **Storage:** The laptop has two drives, a 2 TB SSD and a 1 TB HDD. The SSD holds everything that benefits from fast reads and writes: video and app configs. The HDD gets what doesn't care about speed, like books and backups. Rather than handing whole disks to the cluster, I expose specific folders from each through local-path volumes. Ideally this would be something like NFS, so a second node could reach the same data, but that needs a second machine, and right now I'm broke with exactly one laptop ૮(˶╥︿╥)ა
- **GPUs:**  I started out trying to transcode on the GTX 1050, but I could never get transcoding to work reliably, and the 1050 isn't a great transcoding card to begin with. Then it clicked that the laptop also has an Intel iGPU, and Quick Sync needs no proprietary driver at all. Jellyfin now transcodes on the iGPU, and the 1050 is free for work that actually wants CUDA.

Adding a second node is a single `k3s agent` join command, which is the "config change, not a rebuild" I promised myself. 

#### The platform layer

None of these touch a request on its way to Jellyfin, but they're the reason the cluster is a Git repo and not a pile of commands I ran once and forgot. They're also where most of the DevSecOps learning happened.

**Argo CD**: GitOps. Argo CD watches the repo and makes the cluster match it. I push a commit, and it applies the change. If I edit something by hand with kubectl, it notices the drift and puts it back. [TODO: one line on why Argo CD over Flux, e.g. the UI, app-of-apps pattern, or just what you learned first.]

**Sealed Secrets**: GitOps means everything goes into Git, including passwords and API tokens, which is a problem. Sealed Secrets fixes that: the controller in the cluster holds a private key, and anyone with the public key can encrypt a secret, but only the cluster can decrypt it. The repo can be read by anyone without leaking anything. The catch: if the cluster dies and that private key dies with it, every sealed secret in the repo becomes permanently unreadable. [TODO: how you back up the sealing key, or admit you don't yet. This might be the "Mostly."]

**cert-manager**: Issues and renews TLS certificates for the Gateways. [TODO: issuer, e.g. Let's Encrypt with a DNS-01 challenge through the Cloudflare API, which is also the only way to get the `*.local.homeserverfail.in` wildcard.] This is the part I mentioned earlier: enforcing TLS is easy, and renewal is the hard part. cert-manager is what makes renewal someone else's problem.

**CloudNativePG**: The shared Postgres for everything that needs a real database. Jellyfin sticks to SQLite, but [TODO: which apps use it]. [TODO: backups, if you have them, since this is the other thing a rebuild depends on.]

**MeshCentral**: Agent-based remote access to [TODO: the laptop itself? other machines?]. Not strictly required, but hella useful when something has broken badly enough that kubectl can't reach it. [TODO: one line on how it's exposed and locked down, since readers will ask.]


### What's actually running   
Now on to the meat and potatos

## How? (The Journey)
