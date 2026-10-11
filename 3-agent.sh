#!/bin/bash
# Demo 3 — the 40-line agent fixes the planted bug (slides S16-S18).
# Reset the bug first so the run is reproducible take after take.
set -euo pipefail
cd "$(dirname "$0")" && source ./env.sh

cat > demo-repo/config.py <<'EOF'
respone_timeout = 30  # planted bug: misspelled name


def get_timeout():
    return response_timeout
EOF

PY=../.venv/bin/python
[ -x "$PY" ] || PY=python3   # ponytail: venv if present, else system
[ -d .venv/bin ] && export PATH="$(pwd)/.venv/bin:$PATH"  # so the agent finds pytest

cd demo-repo
"$PY" ../agent.py "Run the tests with pytest. If they fail, fix the code, then run them again."
