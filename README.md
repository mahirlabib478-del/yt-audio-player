# AudioLite

A lightweight Windows desktop media player built with Tauri, Rust, TypeScript, and Vite.

## Features

- Play local audio files with a lightweight audio-only player.
- Play direct audio URLs when the source allows playback and uses a supported format.
- Paste a YouTube video link to open it in YouTube's official embedded player. The video and standard player controls remain visible.
- Play, pause, stop, seek, and adjust volume for local/direct audio sources.
- Switches back to the audio-only player for local files and direct audio URLs; the YouTube iframe is unloaded when leaving that mode.

## YouTube playback limitation

This app does not extract, isolate, or hide YouTube audio streams. YouTube links use the official visible YouTube player. Audio-only playback is available for local audio files and direct audio URLs that you have permission to use.

## Development

Requirements: Node.js LTS, Rust, Microsoft C++ Build Tools on Windows, and WebView2 Runtime.

```powershell
npm install
npm run tauri dev
```

## Windows installer

The GitHub Actions workflow builds the Windows installer on each push to `main`. Download the `AudioLite-Windows-Installer` artifact from the workflow run's Artifacts section.

```powershell
npm run tauri -- build
```

## Performance notes

The app avoids video rendering for local/direct audio sources and does not run background polling or visualizers. CPU and RAM usage must be measured on the target machine; no fixed usage guarantee is made. Embedded YouTube playback uses YouTube's player and therefore includes its own rendering and processing overhead.
