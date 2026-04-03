# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- **Check for Updates**: Button in Settings to manually trigger update check
- **Dynamic Version**: App version in Settings is now read live from `app.getVersion()`

### Changed
- **Server poll interval**: Reduced from 3s to 30s to avoid excessive API calls
- **All UI icons**: Replaced emoji icons with Lucide SVG icons (no more rendering artifacts)
- **Settings translations**: All PIN section strings now fully translated (DE/EN)

### Fixed
- Server detail page no longer resets every 3 seconds (store no longer clears servers on reload)
- Lock button in titlebar was unclickable (missing `WebkitAppRegion: no-drag`)
- `app:lock` IPC now uses `event.sender` instead of `getMainWindow()` (circular dep fix)
- Duplicate IPC listeners on HMR reload (now uses `removeAllListeners` before registering)
- Double `＋` in "Add project" button (plus was in both component and translation string)

---

## [0.1.2] - 2026-04-03

### Added
- **PIN Set Event**: App now notifies on PIN creation to enable Ctrl+L immediately
- **app:reset Event**: Triggers page reload instead of unreliable app.relaunch()
- **onReset Listener**: New IPC listener for handling app reset events

### Changed
- **PIN Reset Workflow**: Now uses page reload instead of app restart (more reliable)
- **Lock Handler**: Improved consistency between hotkey and button-click lock triggers
- **NSIS Configuration**: Removed PNG icon fallback to use only .ico files
- **Icon Handling**: Windows builds now exclude .png and use only .ico format

### Fixed
- Lock button (Ctrl+L) now works immediately after PIN is set (no restart required)
- White page after PIN deletion - now properly reloads instead of crashing
- Project input dialogs no longer unresponsive (z-index issues resolved)
- Unused `app` import removed from appconfig handlers
- PIN deletion now properly clears activity log in addition to projects

### Technical
- Added actionLog.clear() method for complete log deletion
- Added storage.deleteStorageFile() for physical file removal
- Improved event communication between main and renderer processes
- Better error handling in reset workflow

---

## [0.1.1] - 2026-04-03

### Added

- **Auto-Updater**: Automatic update checking with GitHub Releases integration
- **Security Features**: 6-digit PIN protection with Ctrl+L hotkey
- **Lock Screen**: Full-screen lock screen with draggable titlebar and close button
- **Activity Log**: Persistent activity log across app restarts
- **Ctrl+R Blocker**: Prevents accidental app reload
- **Versioning**: npm scripts for applying patch/minor/major version bumps

### Changed

- **electron-builder.yml**: Configuration for Windows NSIS + Portable exe targets
- **Lock Button**: Now positioned in titlebar with tooltip
- **Lock Handler**: Now fully functional via both hotkey and button click
- **Dependencies**: Added electron-updater (v6.1.0)

### Fixed

- Lock button now correctly sends `app:lock` event to renderer
- PIN input auto-submits on 6-digit entry
- LockScreen can now be dragged and closed

### Technical

- Exported `getMainWindow()` function in main/index.ts
- IPC appconfig handler uses getMainWindow() for event communication
- GitHub-based publish configuration in electron-builder

---

## [0.1.0] - 2026-03-15

### Added

- **Initial Release** - Hetzner Cloud Desktop Manager
- **Multi-Project Support**: Manage unlimited Hetzner Cloud projects with encrypted API keys
- **Server Management**: Start, stop, reboot, view details, live metrics
- **VNC Console**: Integrated noVNC console for server access
- **Live Metrics**: CPU and network graphs with real-time data
- **Resources**: Firewalls, networks, floating IPs, load balancers, volumes, snapshots, images, SSH keys, backups
- **Readonly Mode**: Per-project flag for read-only access
- **i18n**: German and English with live switching
- **Dark Theme**: Consistent dark design with CSS variables
- **Electron UI**: Frameless window with custom titlebar

### Features

- Dark mode dashboard
- Real-time CPU normalization (per vCPU)
- Server action logging
- API key encryption via electron safeStorage
- Keyboard shortcuts support
