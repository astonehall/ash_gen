## Current Version

- 0.0.1

## Current UI Track (0.0.2-dev)

- Stack selected: Tauri + React with FastAPI backend sidecar
- Goal: desktop-first app launch on Linux, Windows, and macOS (no CLI required for end users)
- Plugin strategy: define extension architecture now, implement plugin runtime in later phase

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

## Important - Development

Is being done on a Linux Mint 22 machine and needs to run in a virtual env. This is the primary testing and development machine so it has to work here above all else. It needs to be compatible with other os's so keep this in mind
