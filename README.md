# AshGen

SDXL image generation app using Python in the backend and (eventually) a nice simple user interface.

Current version: **0.0.1**

## Current Status

- Backend API scaffold is ready with FastAPI.
- Generation endpoint supports both stub mode and real SDXL single-file checkpoints.
- Startup validation checks model checkpoint configuration when stub mode is disabled.

## Quick Start (Linux Mint 22)

1. Create and activate a virtual environment:
   - `python3 -m venv .venv`
   - `source .venv/bin/activate`
2. Install backend dependencies:
   - `pip install -r backend/requirements.txt`
3. Configure environment:
   - `cp backend/.env.example backend/.env`
   - Set `CHECKPOINTS_DIR` and `MODEL_CHECKPOINT` in `backend/.env` if you want a local model file (use repo-relative paths, not machine-specific absolute paths).
   - Optional API auth: set `ENABLE_API_KEY_AUTH=true` and `API_KEY=<your-secret>`.
4. Run the API from project root:
   - `uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000`

## Test Endpoints

- Health check:
  - `curl http://127.0.0.1:8000/health`
- Model info:
  - `curl http://127.0.0.1:8000/v1/model/info`
  - If auth is enabled: `curl -H "X-API-Key: <your-secret>" http://127.0.0.1:8000/v1/model/info`
- Generate stub output:
  - `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -d '{"prompt":"portrait of a wizard"}'`
  - If auth is enabled: `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -H "X-API-Key: <your-secret>" -d '{"prompt":"portrait of a wizard"}'`

The generate route creates a text artifact in `outputs/` as placeholder output. This keeps API contracts stable while SDXL runtime is integrated.

## Test Local Checkpoint

To test real image generation with a local checkpoint:

1. Install ML runtime dependencies:
   - `pip install -r backend/requirements.txt`
2. In `backend/.env`, set:
   - `ENABLE_STUB_GENERATOR=false`
   - `CHECKPOINTS_DIR=models/checkpoints`
   - `MODEL_CHECKPOINT=test_cp.safetensors`
3. Start the API and send a small test request (faster for first run):
   - `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -d '{"prompt":"portrait photo, soft lighting","width":512,"height":512,"steps":20}'`

The API will write a PNG image to `outputs/` when model inference succeeds.

## UI (0.0.2-dev)

Initial UI implementation lives in `ui/` using React + Vite with a Tauri desktop shell.

1. Install UI dependencies:
   - `cd ui && npm install`
2. Run web UI in development mode:
   - `npm run dev`
3. Run desktop shell in development mode (requires Rust toolchain):
   - `npm run tauri:dev`

The UI currently focuses on backend connectivity and generation flow testing.

## Changelog

### 0.0.1

- Built FastAPI backend foundation with health and generation endpoints.
- Added stub and real SDXL single-file checkpoint generation paths.
- Added model diagnostics endpoint (`/v1/model/info`).
- Added startup validation for checkpoint configuration when real mode is enabled.
- Added optional API key protection (`X-API-Key`) for `/v1` endpoints.
- Improved project portability with repo-relative paths and environment-driven config.

## License

This project is licensed under the Apache License 2.0.

- Full text: `LICENSE`
- Attribution/notice file: `NOTICE`

Model files and checkpoints are not bundled; users must provide their own and comply with their respective licenses.
