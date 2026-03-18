#!/usr/bin/env python3
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
UI_DIR = ROOT / "ui"


def _npm_command() -> str:
    return "npm.cmd" if os.name == "nt" else "npm"


def _run(command: list[str], cwd: Path) -> None:
    print(f"Running: {' '.join(command)}")
    subprocess.run(command, cwd=str(cwd), check=True)


def main() -> int:
    _run(
        [
            sys.executable,
            "-m",
            "unittest",
            "discover",
            "-s",
            "backend/tests",
            "-p",
            "test_*.py",
        ],
        ROOT,
    )
    _run([_npm_command(), "run", "smoke"], UI_DIR)
    print("Smoke checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())