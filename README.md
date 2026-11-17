# NOVA Voice Studio

A personal, minimal text-to-speech workspace for video narration. The repository contains a static GitHub Pages frontend and a small Python API.

## Features

- Two preset narrator choices (male and female)
- Hindi, Bengali, Indian English and Nepali voice selections
- Natural / cinematic-slow / energetic pace controls
- MP3 preview and download
- No user accounts, database, voice history or automatic audio library
- Backend creates a temporary MP3 and deletes it after the audio response is sent; abandoned files are cleaned after 15 minutes

## Important about the voice engine

This first version uses Microsoft Edge's online neural TTS service through the community `edge-tts` Python package. It is not a newly trained NOVA model, and it requires an internet connection. Voice availability and quality depend on the upstream service. The app does not guarantee ElevenLabs-level expressive acting. It is a free-start prototype, not an unlimited hosted service.

## 1. Publish the frontend with GitHub Pages

In the repository, open **Settings → Pages** and set the source to **GitHub Actions**. The included workflow deploys the root folder whenever you push to `main`. Your site will appear at:

`https://barmanbiswa131-design.github.io/My-app-bb/`

## 2. Run the voice API

The GitHub Pages site cannot run Python itself. Start the backend on a computer or a temporary notebook session:

```bash
python -m pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000
```

For use from your phone, expose port 8000 using a temporary HTTPS tunnel you control, then paste that HTTPS address into the **Backend URL** field in the website. Do not publish private tunnel tokens or API credentials in this repository.

Check the backend at `/api/health`.

## 3. Privacy and temporary files

- No database or account system is included.
- The frontend does not save scripts or audio to local storage.
- The backend writes generated MP3 files only under the system temporary directory.
- When the browser fetches the audio, the backend deletes that temporary file after sending it.
- Unclaimed files are cleaned after 15 minutes, and the temporary directory is not a permanent archive.
- The audio remains temporarily in the open browser tab for preview/download. Use **Clear audio** or close the tab to release it.

## Voice presets

The initial preset list uses neural voice names for Hindi, Bengali, Indian English and Nepali. If a voice is unavailable in the upstream service, generation will return an error; the preset list can then be adjusted.

## License

Personal-use project scaffold. Check the upstream voice service's terms and applicable usage rights before publishing or commercial use.


## Dual voice conversation

The web interface now includes **Dual conversation — male + female** mode. Put each speaker turn on a separate line; turns alternate automatically, starting with the male voice. To choose a speaker explicitly, prefix a line with `[M]`, `[F]`, `Male:`, or `Female:`. The backend endpoint `POST /api/tts/dialogue` generates each turn with its selected voice and returns one combined MP3. Restart the Python backend after pulling the latest `server.py` changes.
