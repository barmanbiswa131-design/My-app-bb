# NOVA 2.0 model backend

This is the separate model-serving API for the GitHub Pages interface. GitHub Pages cannot host Python or model weights.

## Model
Default: `Qwen/Qwen2.5-0.5B-Instruct`. It is a compact multilingual instruction model. The first startup downloads model files, so the host needs enough RAM/storage and outbound access.

## Run locally
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```
Open `/health` to check readiness. Set `NOVA_MODEL_ID`, `NOVA_ADAPTER_PATH`, and `NOVA_ALLOWED_ORIGINS` as environment variables when needed. Never commit access tokens or private keys.

## Connect the website
After deploying this API to a Python-capable host, set `API_BASE_URL` in the website's `config.js` to the deployed API origin. Keep it empty until a backend URL actually exists. The website will otherwise use its local fallback brain.

## Important
This backend is not deployed by the GitHub Pages workflow. A running host is required. CPU inference may be slow; a GPU host is preferable. The first model download can be large.

## Command-driven web learning (new)

The API supports explicit learning commands:
- `NOVA শেখো: solar system`
- `NOVA shikho: Bengali grammar`
- `/learn climate change`

It searches the public web using DDGS, stores short result snippets and source URLs in SQLite, and adds matching saved notes as reference context in later chats. It does **not** silently retrain or change model weights. Web content is untrusted reference data; the model is instructed not to follow instructions embedded in it.

For persistent knowledge, deploy with a persistent disk mounted at `/data` and set `NOVA_KNOWLEDGE_DB=/data/nova_knowledge.sqlite3`. Without a persistent disk, notes may be lost when the host restarts or redeploys. Search availability depends on the public search service and may be rate-limited.

This feature is part of the backend code only. It will not work in the temporary Colab Gradio demo or GitHub Pages local fallback until this API is deployed and its URL is entered in `config.js`. A one-time backend deployment and persistent storage setup are still required.
