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
4. Run the API from project root:
   - `uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000`

## Test Endpoints

- Health check:
  - `curl http://127.0.0.1:8000/health`
- Generate stub output:
  - `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -d '{"prompt":"portrait of a wizard"}'`

The generate route creates a text artifact in `outputs/` as placeholder output. This keeps API contracts stable while SDXL runtime is integrated.

## Next Steps

- Wire real SDXL pipeline behind the generation service.
- Add queueing + cancellation for long-running jobs.
- Add minimal cross-platform desktop UI shell.
- Add auth, gallery, and history after core generation is stable.
