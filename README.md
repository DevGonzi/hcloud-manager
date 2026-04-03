# hcloud-manager

> a desktop app for managing hetzner cloud. because the web ui is fine but sometimes you just want a native thing that sits in your taskbar.

**[Deutsche Version](README.de.md)**

---

## what is this

it's an electron app that talks to the hetzner cloud api and lets you manage your servers, firewalls, networks, volumes, ssh keys, floating ips, load balancers, snapshots, images - basically everything. dark theme, live cpu metrics, vnc console, the whole deal.

built this because i manage like 15 servers across 3 projects and clicking through the hetzner ui every time got old real fast. proxmox has this vibe where everything is in one place and you can see what's happening at a glance. wanted that but for hetzner.

the real problem it solves: you're deep in code, something's wrong, you need to restart a server or check if cpu is spiking. the hetzner web ui means - find the tab (it's buried somewhere between 50 others), wait for it to load, log in again because the session expired, navigate to the right project, find the server. by then you've lost your train of thought completely. this app lives in your taskbar. click, done, back to work.

it's not perfect. it's open source. PRs welcome.

---

## features

- **multi-project** - add as many hetzner projects as you want, switch between them instantly. api keys are stored encrypted via electron safeStorage, not in plain text somewhere on your disk
- **readonly mode** - per-project flag that disables all write actions. useful if you want to give someone access to monitor without letting them accidentally nuke a production server at 3am
- **servers** - start, stop, reboot, live cpu graph, server details, console
- **vnc console** - opens in a separate window, connects to `wss://console.hetzner.cloud`. actually works
- **live metrics** - cpu and network graphs that poll the hetzner metrics api on a configurable interval
- **firewalls** - view rules (inbound/outbound), see what servers they're applied to, delete
- **networks** - list view with subnets and routes
- **floating ips** - list, create, see assignment status
- **load balancers** - list with services and targets
- **volumes** - list, create, see attachment status
- **snapshots** - create from running servers, delete, convert to image
- **images** - browse system and app images (no snapshots here, they have their own page)
- **ssh keys** - list, add, delete, copy fingerprint
- **backups** - per-server backup management, enable/disable, delete individual backups
- **i18n** - german and english, switches live

---

## if you don't have hetzner yet

genuinely one of the best vps providers out there. cheap, eu-based, fast network, clean api that's actually documented, no surprise bills. been using them for years.

use my referral link - you get 20€ credits and i get some too:

**➜ [hetzner.cloud/?ref=Rb92rAsFUGWC](https://hetzner.cloud/?ref=Rb92rAsFUGWC)**

---

## install

### prebuilt release

grab the latest from [releases](https://github.com/DevGonzi/hcloud-manager/releases).

| platform | file                                   |
| -------- | -------------------------------------- |
| windows  | `.exe` installer                       |
| linux    | `.AppImage`                            |
| mac      | `.dmg` (untested, theoretically works) |

### build from source

needs node 18+ and npm.

```bash
git clone https://github.com/DevGonzi/hcloud-manager.git
cd hcloud-manager
npm install

npm run dev          # dev mode with hot reload
npm run build:win    # package for windows
npm run build:linux  # package for linux
npm run build:mac    # package for mac (good luck)
```

---

## tech stack

- [electron](https://electronjs.org) + [electron-vite](https://electron-vite.org)
- react 18 + typescript
- [zustand](https://github.com/pmndrs/zustand) for state
- [recharts](https://recharts.org) for the metric graphs
- [novnc](https://github.com/novnc/noVNC) for vnc console
- inline styles with css variables (had tailwind v4, fought with it, won by not using it)
- JetBrains Mono for that monospace everything aesthetic

---

## project structure

```
src/
  main/         # electron main process - ipc handlers, hetzner api client, ttl cache
  preload/      # contextBridge - exposes the api to renderer securely
  renderer/     # the actual react app
    pages/      # one file per resource type (servers, networks, firewalls, etc)
    components/ # shared bits (sidebar, titlebar, server detail panel, metrics charts)
    stores/     # zustand stores for servers and projects
    i18n/       # de.json + en.json
  shared/       # typescript types shared between main and renderer
```

---

## stuff that's missing / on the list

- [ ] networking and volumes detail views (currently read-only list)
- [ ] floating ip assignment
- [ ] load balancer target management
- [ ] auto-updater
- [ ] server creation wizard (basic version exists, needs polish)

if you want to implement something, just open an issue first so we're not building the same thing at the same time.

---

## contributing

fork it, fix something, open a PR. no strict process. if the ci passes and it doesn't look insane, it'll probably get merged.

bug reports: open an issue. steps to reproduce appreciated. "it doesn't work" less so.

---

## license

MIT. do whatever.

---

_– [gonzi](https://github.com/DevGonzi)_
