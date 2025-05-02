---
author: Sathya Narayana Bhat
pubDatetime: 2024-11-11T17:24:29Z
modDatetime: 2025-05-02T12:00:00Z
title: Setting up EA Play in Linux via Steam 
slug: setting-up-ea-play-in-linux-via-steam
featured: true
draft: false
tags:
  - gaming
  - linux
  - fedora
  - EA
  - titanfall
description:
    Setting up EA Play in fedora and some resources to learn more.
---

If there is ONE game i have suffered through hell to make it work on linux is ...

![alt text](https://media.tenor.com/a0WzmV84BrkAAAAM/prepare-for-titanfall.gif)

If it wasnt clear, the game i am talking about is titanfall.

So i searched the world wide web, Tried various methods, most didnt work. So if this gets famous, well at the least some more people will know how to setup one of the most annoying launcher [competing with ubisoft, tho that did work in one shot with no configuration changes]. 

So first lets talk Configurations:
```
GPU: Nvidia 1050
CPU: Intel core i7 7th gen
RAM: 16 GB
GPU vRAM: 4GB
OS: Nobara
```

So...Lets jump right into it

## Steps

- Install Steam and sign in
- Enable forced compatablity in global settings
- Buy n download Titanfall
- Go to properties of the game
- Go to Compatablity
- Force proton version
- Change proton version to latest of 5.x
- Run the game
- It will install EA Play, which may take a minute
- Stop the game after EA Play installation is complete and game launches
- Change proton version to proton experimental
- ![alt text](https://www.icegif.com/wp-content/uploads/2022/06/icegif-78.gif)prepare for titan fall


This should work for pretty much all EA games, n if it didnt let me know, will try to help.

### The end