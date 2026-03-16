## Current Version

- 0.0.3

## Current UI Track (0.0.3)

- Stack selected: Tauri + React with FastAPI backend sidecar
- Goal: desktop-first app launch on Linux, Windows, and macOS (no CLI required for end users)
- Plugin strategy: define extension architecture now, implement plugin runtime in later phase
- Current UI direction: traditional desktop application layout

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
  - sidebar widths and collapsed/open state
- Persistence should be designed to support future upgrades and migrations cleanly

## Plugin / Extension Direction (Planned)

- Future user-created extensions are a required capability
- Architecture should keep clear extension boundaries now, even before plugin runtime exists
- Backend-first extension points are preferred initially
- Frontend plugin runtime is deferred until the core UI stabilizes
- No arbitrary plugin execution should be implied or enabled yet

## UI/UX Baseline (Locked)

- **Top bar:** compact scrollable settings/status strip
- **Left sidebar:** main generation controls, collapsible and resizable
- **Main workspace:** preview area + finished generation gallery
- **Bottom dock:** fixed positive and negative prompt fields
- **Right sidebar:** reserved advanced options area, collapsible and resizable

Notes:

- Keep the interface compact and desktop-like.
- Avoid large rounded mobile-style controls and wasted space.
- Advanced options should use progressive disclosure and live in the right sidebar over time.

## Project Goal - Long Term

- Create python backend that can run SDXL Illustrious models to generate images
- Create a user interface that can work on Linux, windows and macosx
- The user interface is to be friendly, simple and intuitive
- Loras, controlnet, fixes, upscaling should be options

## Short Term Goals

- Set up Python environment and dependencies for SDXL Illustrious model integration
- Build basic API endpoints for image generation requests
- Refine the desktop UI shell (Tauri + React) now that the first full-screen layout exists
- Define plugin extension boundaries (manifest + API contracts) without building plugins yet
- Implement core image generation pipeline with single model support - more are possible in the future
- Validate platform-specific desktop builds for Linux first, then Windows and macOS parity
- Add saved local workspace/configuration state
- Expand the image gallery workflow and image selection behavior

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
