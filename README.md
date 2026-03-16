# AshGen

SDXL image generation app with a FastAPI backend and a desktop-first UI shell built with React, Vite, and Tauri.

Current version: **0.0.2**

## Current Status

- FastAPI backend is running with health, generation, and model info routes.
- Generation supports both stub mode and real SDXL single-file checkpoints.
- Startup validation checks checkpoint configuration when stub mode is disabled.
- Local browser UI can connect to the backend, preview generated files, and browse a compact gallery.
- Current frontend is a full-screen desktop-style shell with a compact top settings bar, collapsible/resizable sidebars, central preview/gallery workspace, and bottom prompt dock.

## Quick Start - (My dev environment Linux Mint 22 )

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
- Generate output:
  - `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -d '{"prompt":"portrait of a wizard"}'`
  - If auth is enabled: `curl -X POST http://127.0.0.1:8000/v1/generate -H "Content-Type: application/json" -H "X-API-Key: <your-secret>" -d '{"prompt":"portrait of a wizard"}'`

When stub mode is enabled, the generate route writes a placeholder text artifact to `outputs/`. When real checkpoint inference is enabled, it writes a PNG image to `outputs/`.

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

Current desktop shell includes:

- Scrollable top settings/status bar
- Collapsible and resizable left and right side panels
- Central preview area for selected output
- Compact gallery of finished generations
- Bottom-docked positive and negative prompt fields

## Current UI Layout

The current desktop UI follows a compact full-screen layout:

1. **Top bar**
   - Backend connection
   - API key input
   - Status and model readout
   - Scrollable compact settings tiles

2. **Left sidebar**
   - Main generation controls
   - Canvas and sampling parameters
   - Generate action
   - Collapsible and resizable

3. **Main workspace**
   - Preview area for selected output
   - Gallery of completed generations
   - Positive and negative prompt dock fixed to the bottom

4. **Right sidebar**
   - Reserved space for future advanced tools/options
   - Temporary session/debug information
   - Collapsible and resizable

History and detailed metadata are intentionally de-emphasized for now while the main generation workspace is being established.

## Frontend Stack

The current frontend stack is:

- Tauri for the desktop shell
- React for the UI layer
- Tailwind CSS + shadcn/ui for styling and components
- TanStack Query for backend/API state
- React Hook Form + Zod for forms and validation
- Lucide React for icons

Framer Motion is intentionally deferred until the core UX is stable, and direct Radix UI usage should only be added when needed beyond shadcn/ui.

## Saved Workspaces and Extensions (Planned)

- Saved local workspaces/configuration are planned as a first-class feature.
- The preferred persistence approach is versioned local JSON stored in the app data directory.
- Future plugin/extension support is also planned, but plugin runtime is not implemented yet.
- Current planning direction is to keep clear extension boundaries now and implement backend-first extension points before any frontend plugin runtime.

## Changelog

### 0.0.2

- Added initial UI in `ui/` (React + Vite) with Tauri shell scaffold (`src-tauri`).
- Added backend CORS support for local UI development origins.
- Added backend static `outputs` mount so generated images can be previewed in the UI.
- Added negative prompt support and generated image preview in the UI.
- Reworked the frontend into a desktop-style full-screen shell.
- Added compact top settings/status bar with horizontal scrolling.
- Added collapsible and resizable left/right sidebars.
- Added central preview/gallery workspace with selectable image preview.
- Added bottom prompt dock for positive and negative prompts.
- Replaced deprecated FastAPI startup event with lifespan handler.
- Pinned backend and UI dependency versions for reproducible installs.
- Added explicit project rule that easy user upgrades/updates are a core requirement.

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
