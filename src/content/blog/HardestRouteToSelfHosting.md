---
author: Sathya Narayana Bhat
pubDatetime: 2026-09-18T05:00:00Z
modDatetime: 
title: I Chose the Hardest Possible Way to Run Jellyfin
slug: i-chose-the-hardest-possible-way-to-selfhosting
featured: true
draft: true
tags:
  - kubernetes
  - k3s
  - gitops
  - argocd
  - secrets
  - 
  - selfhosting
  - homelab
description:
  Why I put Kubernetes on an old laptop with a dying screen to run Jellyfin,
  and every way it fell over between kind and k3s.
---

I am writing this after the first night in ~6 months that nothing crashed and nothing went unreachable. The whole cluster is described in a Git repo now, every service is behind Traefik with real certificates, and I can rebuild the server from scratch if the disk dies. Mostly.

Getting there involved a lot of nights that were not like that. An early one went like: the `cloudflared` logs said connected. The Pods said running. Traefik said routing. The browser said nothing at all. Turns out everything was working as intended which also included the firewall which was just quietly dropping all incoming requests by default.

This is an ongoing journey, so I thought I would write it down as I go, partly as a record of how and why I got into self-hosting and Kubernetes, and partly in case it saves someone else a few hours. I have split this post into three parts: Why, What, and How.

## Why? (The Motive)

## What? (The Stack)

## How? (The Journey)
