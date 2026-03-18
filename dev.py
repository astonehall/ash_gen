#!/usr/bin/env python3
from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path


ROOT = Path(__file__).resolve().parent
UI_DIR = ROOT / "ui"
BACKEND_HOST = os.environ.get("ASHGEN_BACKEND_HOST", "127.0.0.1")
BACKEND_PORT = int(os.environ.get("ASHGEN_BACKEND_PORT", "8000"))
FRONTEND_HOST = os.environ.get("ASHGEN_FRONTEND_HOST", "127.0.0.1")
FRONTEND_PORT = int(os.environ.get("ASHGEN_FRONTEND_PORT", "5173"))
BACKEND_URL = f"http://{BACKEND_HOST}:{BACKEND_PORT}/health"
FRONTEND_URL = f"http://{FRONTEND_HOST}:{FRONTEND_PORT}"


def _npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def _spawn(command: list[str], cwd: Path, env: dict[str, str] | None = None) -> subprocess.Popen:
    kwargs: dict[str, object] = {
        "cwd": str(cwd),
        "env": env,
    }

    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True

    return subprocess.Popen(command, **kwargs)


def _stop_process(process: subprocess.Popen) -> None:
    if process.poll() is not None:
        return

    try:
        if os.name == "nt":
            process.terminate()
        else:
            os.killpg(process.pid, signal.SIGTERM)
    except Exception:
        process.terminate()

    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()


def _wait_for_http(url: str, timeout_seconds: int = 60) -> None:
    deadline = time.time() + timeout_seconds
    last_error: Exception | None = None

    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2):
                return
        except Exception as exc:
            last_error = exc
            time.sleep(1)

    raise RuntimeError(f"Timed out waiting for {url}: {last_error}")


def _handle_stop(_signum: int, _frame: object) -> None:
    raise KeyboardInterrupt


def _port_in_use(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((host, port)) == 0


def main() -> int:
    if _port_in_use(BACKEND_HOST, BACKEND_PORT):
        print(
            f"Backend port {BACKEND_PORT} is already in use on {BACKEND_HOST}. "
            "Set ASHGEN_BACKEND_PORT to use a different port.",
            file=sys.stderr,
        )
        return 1

    if _port_in_use(FRONTEND_HOST, FRONTEND_PORT):
        print(
            f"Frontend port {FRONTEND_PORT} is already in use on {FRONTEND_HOST}. "
            "Stop the existing dev server or set ASHGEN_FRONTEND_PORT to another port.",
            file=sys.stderr,
        )
        return 1

    backend_command = [
        sys.executable,
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--reload",
        "--host",
        BACKEND_HOST,
        "--port",
        str(BACKEND_PORT),
    ]
    frontend_env = os.environ.copy()
    frontend_env.setdefault(
        "VITE_API_BASE_URL",
        f"http://{BACKEND_HOST}:{BACKEND_PORT}",
    )
    frontend_command = [
        _npm_command(),
        "run",
        "dev",
        "--",
        "--host",
        FRONTEND_HOST,
        "--port",
        str(FRONTEND_PORT),
    ]

    for sig in (signal.SIGINT, signal.SIGTERM):
        signal.signal(sig, _handle_stop)

    print("Starting backend...")
    backend_process = _spawn(backend_command, ROOT)
    print("Starting frontend...")
    frontend_process = _spawn(frontend_command, UI_DIR, env=frontend_env)

    try:
        _wait_for_http(BACKEND_URL)
        _wait_for_http(FRONTEND_URL)
        webbrowser.open(FRONTEND_URL)
        print(f"Opened {FRONTEND_URL}")

        while True:
            if backend_process.poll() is not None:
                raise RuntimeError("Backend process exited unexpectedly.")
            if frontend_process.poll() is not None:
                raise RuntimeError("Frontend process exited unexpectedly.")
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping development processes...")
        return 0
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    finally:
        _stop_process(frontend_process)
        _stop_process(backend_process)


if __name__ == "__main__":
    raise SystemExit(main())