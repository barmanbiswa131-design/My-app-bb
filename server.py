import asyncio
import os
import re
import time
import uuid
from pathlib import Path

import edge_tts
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

TEMP_DIR = Path(os.environ.get("NOVA_TEMP_DIR", "/tmp/nova-voice"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)
app = FastAPI(title="NOVA Voice API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to your own Pages URL when deploying publicly.
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

ALLOWED_VOICES = {
    "hi-IN-MadhurNeural", "hi-IN-SwaraNeural",
    "bn-IN-BashkarNeural", "bn-IN-TanishaaNeural",
    "en-IN-PrabhatNeural", "en-IN-NeerjaNeural",
    "ne-NP-SagarNeural", "ne-NP-HemkalaNeural",
}

class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=12000)
    voice: str
    rate: int = Field(default=0, ge=-25, le=25)
    pitch: int = Field(default=0, ge=-10, le=10)

class DialogueLine(BaseModel):
    text: str = Field(min_length=1, max_length=3000)
    voice: str

class DialogueRequest(BaseModel):
    lines: list[DialogueLine] = Field(min_length=2, max_length=40)
    rate: int = Field(default=0, ge=-25, le=25)
    pitch: int = Field(default=0, ge=-10, le=10)

def remove_file(path: Path):
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass

def cleanup_old_files():
    cutoff = time.time() - 15 * 60
    for path in TEMP_DIR.glob("*.mp3"):
        try:
            if path.stat().st_mtime < cutoff:
                remove_file(path)
        except OSError:
            pass

@app.get("/api/health")
async def health():
    cleanup_old_files()
    return {"ok": True, "service": "NOVA Voice API", "storage": "temporary-only"}

@app.post("/api/tts")
async def create_voice(payload: TTSRequest):
    cleanup_old_files()
    if payload.voice not in ALLOWED_VOICES:
        raise HTTPException(status_code=400, detail="Voice is not in the allowed preset list.")
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    job_id = uuid.uuid4().hex
    output = TEMP_DIR / f"{job_id}.mp3"
    rate = f"{payload.rate:+d}%"
    pitch = f"{payload.pitch:+d}Hz"
    try:
        communicate = edge_tts.Communicate(
            payload.text.strip(), payload.voice, rate=rate, pitch=pitch
        )
        await communicate.save(str(output))
        if not output.exists() or output.stat().st_size == 0:
            raise RuntimeError("The speech service returned an empty audio file.")
    except Exception as exc:
        remove_file(output)
        raise HTTPException(status_code=502, detail=f"Speech generation failed: {str(exc)[:180]}")

    # The generated file is returned once and deleted immediately after the response is sent.
    return {"audio_url": f"/api/audio/{job_id}", "format": "mp3"}

@app.post("/api/tts/dialogue")
async def create_dialogue(payload: DialogueRequest):
    cleanup_old_files()
    if sum(len(line.text) for line in payload.lines) > 12000:
        raise HTTPException(status_code=400, detail="Dialogue is limited to 12,000 characters.")
    for line in payload.lines:
        if line.voice not in ALLOWED_VOICES:
            raise HTTPException(status_code=400, detail="A dialogue voice is not in the allowed preset list.")

    job_id = uuid.uuid4().hex
    output = TEMP_DIR / f"{job_id}.mp3"
    parts = []
    try:
        for index, line in enumerate(payload.lines):
            part = TEMP_DIR / f"{job_id}-{index}.mp3"
            communicate = edge_tts.Communicate(
                line.text.strip(), line.voice,
                rate=f"{payload.rate:+d}%", pitch=f"{payload.pitch:+d}Hz"
            )
            await communicate.save(str(part))
            if not part.exists() or part.stat().st_size == 0:
                raise RuntimeError("A dialogue line returned empty audio.")
            parts.append(part)
        with output.open("wb") as combined:
            for part in parts:
                combined.write(part.read_bytes())
        if output.stat().st_size == 0:
            raise RuntimeError("The combined dialogue audio is empty.")
    except Exception as exc:
        remove_file(output)
        raise HTTPException(status_code=502, detail=f"Dialogue generation failed: {str(exc)[:180]}")
    finally:
        for part in parts:
            remove_file(part)

    return {"audio_url": f"/api/audio/{job_id}", "format": "mp3"}


@app.get("/api/audio/{job_id}")
async def get_audio(job_id: str):
    if not re.fullmatch(r"[a-f0-9]{32}", job_id):
        raise HTTPException(status_code=404, detail="Audio not found.")
    path = TEMP_DIR / f"{job_id}.mp3"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Audio expired or already downloaded.")
    return FileResponse(
        path,
        media_type="audio/mpeg",
        filename="NOVA-voice.mp3",
        background=BackgroundTask(remove_file, path),
    )
