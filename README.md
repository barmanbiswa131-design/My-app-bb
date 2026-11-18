# NOVA 2.0

A small, friendly AI companion — built as a web app first, then planned for Android APK.

## Current prototype
- Mobile-first chat interface (English UI)
- Tiny local rule-based brain for short, supportive replies
- Session-only conversation context; no account, database, or saved chat history
- Offline shell via service worker
- Hybrid API adapter: set `API_BASE_URL` in `config.js` when a backend is ready
- No external AI API key and no human voice recordings in this prototype

## Run
Open the GitHub Pages site after enabling Pages for this branch, or serve this folder with any static web server.

## Next development stages
1. Improve the local intent/context engine and add tests for Bangla, Banglish, Hindi and English.
2. Build a small online brain endpoint with a privacy-conscious, low-resource model.
3. Build a fully synthetic speech engine. The current prototype intentionally does not use recorded human voices or device TTS voices.
4. Add speech input and offline model options after testing mobile memory and performance.
5. Package the tested web app as an Android APK.

## Hybrid design
The app always has a local fallback. If an API URL is configured and reachable, it tries the online brain first; when the connection fails, it replies using the local brain.

This is an early prototype, not yet a full language model or a natural spoken voice.
