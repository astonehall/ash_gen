#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

python_cmd="${PYTHON:-}"
if [[ -z "$python_cmd" ]]; then
	if [[ -x ".venv/bin/python" ]]; then
		python_cmd=".venv/bin/python"
	else
		python_cmd="python3"
	fi
fi

exec "$python_cmd" dev.py