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
