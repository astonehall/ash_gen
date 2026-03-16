## Current Version

- 0.0.2

## Current UI Track (0.0.2)

- Stack selected: Tauri + React with FastAPI backend sidecar
- Goal: desktop-first app launch on Linux, Windows, and macOS (no CLI required for end users)
- Plugin strategy: define extension architecture now, implement plugin runtime in later phase

## Frontend Stack (Locked)

- Desktop shell: Tauri
- UI framework: React
- Styling/component approach: Tailwind CSS + shadcn/ui
- Server/API state: TanStack Query
- Forms and validation: React Hook Form + Zod
- Icons: Lucide React
- Motion: Framer Motion later only, once the core UX is stable
- Direct Radix usage: optional only when needed beyond shadcn/ui

## Workspace Persistence (Planned)

- Saved workspaces/configuration are a first-class feature
- Default persistence approach: versioned local JSON stored in the app data directory
- Initial saved data should include:
  - prompt
  - negative prompt
  - generation parameters
  - selected model/checkpoint
  - UI layout state
  - recent history metadata
- Persistence should be designed to support future upgrades and migrations cleanly

## Plugin / Extension Direction (Planned)

- Future user-created extensions are a required capability
- Architecture should keep clear extension boundaries now, even before plugin runtime exists
- Backend-first extension points are preferred initially
- Frontend plugin runtime is deferred until the core UI stabilizes
- No arbitrary plugin execution should be implied or enabled yet

## UI/UX Baseline (Locked)

- **Top bar:** model status, device, settings
- **Left panel:** prompt, negative prompt, generation params
- **Right panel:** output preview + metadata (seed, steps, model)
- **Bottom/side drawer:** history queue and logs

Notes:

- Keep first implementation simple and intuitive.
- Advanced options should use progressive disclosure (hidden by default).
- Final component/library choices remain pending review.

## Project Goal - Long Term

- Create python backend that can run SDXL Illustrious models to generate images
- Create a user interface that can work on Linux, windows and macosx
- The user interface is to be friendly, simple and intuitive
- Loras, controlnet, fixes, upscaling should be options

## Short Term Goals

- Set up Python environment and dependencies for SDXL Illustrious model integration
- Build basic API endpoints for image generation requests
- Implement initial desktop UI shell (Tauri + React) with backend connectivity checks
- Define plugin extension boundaries (manifest + API contracts) without building plugins yet
- Implement core image generation pipeline with single model support - more are possible in the future
- Validate platform-specific desktop builds for Linux first, then Windows and macOS parity
- Develop user authentication and session management
- Build image gallery and history features

## Project Philosophy

- Simple Interface
- Best Quality images without over the top technical knowhow
- Flexible enough to allow customisation

## Rules

- No bloat, packages should make sense and introducing new ones needs a good reason
- Clean, maintainable code
- Documentation
- Easy upgrades and updates are a core requirement; release changes must preserve a simple user update path across supported OSs

## Important - Development

Is being done on a Linux Mint 22 machine and needs to run in a virtual env. This is the primary testing and development machine so it has to work here above all else. It needs to be compatible with other os's so keep this in mind
