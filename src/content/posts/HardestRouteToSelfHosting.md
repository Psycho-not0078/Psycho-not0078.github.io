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
  Why I put Kubernetes on an old laptop with a dying screen to run Jellyfin,
  and every way it fell over between kind and k3s.
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

I don't retain anything I'm not actively using. Reading about Deployments and Services gets me to the end of the page and no further. So I do it backwards: pick something I actually want, write down what it has to do, and build until it does that. Jellyfin on my own hardware was the requirement. Everything else in this post is what it took to meet it — and every time I learned something new, it went straight into the cluster if it made the existing setup better.

#### **Security**
So far my career has been security engineering alongside a DevOps team, which means I've spent it on the reviewing side of the wall. I know what the failure looks like — telnet reachable from the internet, a web app happily serving over plaintext, a cert nobody renewed. What I'd never done is be the person who has to fix it, on a deadline, without breaking the thing that's already running.

That gap bothered me. It's easy to write a finding that says "enforce TLS on all endpoints" and never learn that the hard part isn't the enforcing, it's the renewal, the redirect chain, and the one internal service that breaks when you turn it on. I wanted to build the thing I usually audit, so that next time I can hand over a solution instead of a problem.

Also, bragging rights.

#### **Hardware**
The laptop is an HP Pavilion 15 Gaming that I got when I started college — 16 GB of RAM, a GTX 1050, a 2 TB WD Black SSD and a 1 TB HDD of unknown parentage. It was a pain in the ass for most of its life, but it was my pain in the ass, and when the screen started dying and I replaced it with a desktop, throwing it out felt wrong.

It also turned out to be a better fit for the job than I expected. I ignored the 1050 for Jellyfin and let it transcode on the integrated Intel GPU instead — Quick Sync handles everything I throw at it, it doesn't need a proprietary driver kept in lockstep with kernel updates, and it sips power on a machine that's on all day. That leaves the 1050 free for work that actually wants CUDA: Blender renders, or a small LLM I can point at from the rest of the cluster. Two GPUs, two jobs, neither fighting the other for a machine that's on 24/7 anyway. 16 GB is more RAM than a single-node k3s cluster serving video to one household will ever need.

So I turned it into a one-node cluster, set up so that adding a second node later would be a config change rather than a rebuild. The rest is this post.


### But this is a Docker Compose job right? 
#### Yes, Yes it is,
A docker-compose.yml with Jellyfin, a reverse proxy and a volume mount would have taken an evening, and it would still be running today without me thinking about it once
![alt text](https://media.tenor.com/kEEj3J50F6QAAAAi/so-why-derek-muller.gif)

The media server was the excuse, not the point. What I wanted was a machine where the answer to "what is running here" is a Git repo, not my memory of what I docker run-ed eight months ago. Every service declared, every change a commit, and a rebuild path that doesn't depend on me remembering anything.

That part worked. Six months in, I can hand you a repo URL and you can rebuild my server. Everything between here and there is the rest of this post.

## What? (The Stack)


## How? (The Journey)
