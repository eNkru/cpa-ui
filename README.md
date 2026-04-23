# cpa-ui

A lightweight desktop app that wraps a local web management interface in a native window. Built with Tauri v2, React, and TypeScript.

## What it does

Points a full-screen native webview at a configurable URL (default: `http://localhost:8317/management.html#/`). The target URL is typically a locally running web service — the app just gives it a clean desktop shell with persistent config.

## Features

- Full-screen native webview — no browser chrome, no tabs
- Configurable target URL, saved to disk and restored on next launch
- Native OS menu with keyboard shortcuts (no overlapping toolbar)
- Auto-resizes the webview when the window is resized

## Keyboard shortcuts

| Action | Shortcut |
|--------|----------|
| Reload | `Cmd+R` / `Ctrl+R` |
| Settings | `Cmd+,` / `Ctrl+,` |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/)
- Tauri system dependencies — see [Tauri prerequisites](https://tauri.app/start/prerequisites/)

## Getting started

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Produces platform-native bundles (`.dmg` / `.app` on macOS, `.msi` / `.nsis` on Windows) in `src-tauri/target/release/bundle/`.

## Configuration

On first launch the app connects to `http://localhost:8317/management.html#/`. To change it, open **App > Settings** from the menu bar, enter a new URL, and save. The setting is stored in the OS app data directory and persists across restarts.

## Project structure

```
src/                  React frontend
  App.tsx             Root component, native menu setup
  components/
    WebViewArea.tsx   Manages the Tauri child webview
    ConfigModal.tsx   Settings dialog
  lib/tauri.ts        Tauri command wrappers
src-tauri/            Rust backend
  src/lib.rs          get_config / save_config commands
  capabilities/       Tauri permission definitions
```

## Tech stack

- [Tauri v2](https://tauri.app/) — native shell
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — frontend build
- [Vitest](https://vitest.dev/) — unit tests (`npm test`)

## Special thanks
[LINUX DO](https://linux.do/)
