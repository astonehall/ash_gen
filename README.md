# AshGen

MVP foundation for a cross-platform SDXL image generation app.

## Current Status

- Backend API scaffold is ready with FastAPI.
- Generation endpoint is live with a stub output mode.
- Structure is prepared to replace the stub with SDXL runtime.

## Quick Start (Linux Mint 22)

1. Create and activate a virtual environment:
   - `python3 -m venv .venv`
   - `source .venv/bin/activate`
2. Install backend dependencies:
   - `pip install -r backend/requirements.txt`
3. Configure environment:
   - `cp backend/.env.example backend/.env`
   - Set `CHECKPOINTS_DIR` and `MODEL_CHECKPOINT` in `backend/.env` if you want a local model file (use repo-relative paths, not machine-specific absolute paths).
4. Run the API from project root:
   - `uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000`

## Test Endpoints

- Health check:
  - `curl http://127.0.0.1:8000/health`
- Model info:
  - `curl http://127.0.0.1:8000/v1/model/info`
- Generate stub output:
  - `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -d '{"prompt":"portrait of a wizard"}'`

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

## Next Steps

- Wire real SDXL pipeline behind the generation service.
- Add queueing + cancellation for long-running jobs.
- Add minimal cross-platform desktop UI shell.
- Add auth, gallery, and history after core generation is stable.
