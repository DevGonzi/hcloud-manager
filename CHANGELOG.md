# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project follows [Semantic Versioning](https://semver.org/).

---

## [0.1.3] - 2026-04-03

### Added
- **Multi-project support** — add unlimited Hetzner projects, API keys encrypted via electron safeStorage
- **Server management** — start, stop, reboot, live CPU graph, server details
- **VNC console** — opens in separate window, connects to `wss://console.hetzner.cloud`
- **Live metrics** — CPU and network graphs polling the Hetzner metrics API
- **Firewalls** — view inbound/outbound rules, see attached servers, delete
- **Networks** — list view with subnets and routes
- **Floating IPs** — list, create, see assignment status
- **Load balancers** — list with services and targets
- **Volumes** — list, create, see attachment status
- **Snapshots** — create from running servers, delete, convert to image
- **Images** — browse system and app images
- **SSH keys** — list, add, delete, copy fingerprint
- **Backups** — per-server backup management, enable/disable, delete individual backups
- **PIN protection** — 6-digit PIN with Ctrl+L hotkey and lock screen
- **Activity log** — persistent audit log of all server actions across restarts
- **Auto-updater** — automatic update checking with GitHub Releases
- **Check for Updates** button in Settings (manual trigger)
- **i18n** — German and English, switches live
- **Readonly mode** — per-project flag that disables all write actions
- **Not-affiliated disclaimer** — in app footer and README

### Fixed
- **Window icon** — icon.ico is now placed outside ASAR via `extraResources` so Windows can read it
- **Slow startup** — electron-updater is now loaded after window creation, non-blocking
- **Lock button** — clicking the 🔒 in the titlebar now works immediately after setting a PIN
- **Server detail page** — no longer resets every 3 seconds during background polling
- **Duplicate IPC listeners** — no longer stack up on hot reload
- **Double + in project switcher** — fixed duplicate plus sign in add project button

---

## [0.1.0] - 2026-03-15

Initial scaffold.
