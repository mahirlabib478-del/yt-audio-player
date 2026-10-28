# AudioLite

A lightweight Windows desktop audio player built with Tauri, Rust, TypeScript, and Vite.

## Current MVP

- Play local audio files.
- Play direct audio URLs when the source permits playback and serves a supported audio format.
- Play, pause, stop, seek, and adjust volume.
- Keep the interface intentionally simple: no video renderer, visualizer, or background polling.
- Detect YouTube links and explain that this app does not extract or hide YouTube video streams. Use YouTube through its official player, or use an audio file/direct audio source you own or are permitted to play.

## Requirements

- Node.js LTS
- Rust toolchain
- Microsoft C++ Build Tools on Windows
- WebView2 Runtime (usually already installed on modern Windows)

## Development

```powershell
npm install
npm run tauri dev
```

## Production build

```powershell
npm run tauri build
```

## Notes

This project is an initial scaffold. CPU and RAM usage should be measured on the target computer; no fixed usage guarantee is made. Direct remote audio URLs may fail if the server blocks access, requires authentication, or does not provide a browser-compatible audio stream.
