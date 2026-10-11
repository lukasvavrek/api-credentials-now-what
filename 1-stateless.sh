#!/bin/bash
# Demo 1 — the amnesia gag (slides S2-S4). Three calls, three screenshots.
set -euo pipefail
cd "$(dirname "$0")" && source ./env.sh

chat() { # chat '<messages json array>'  -> prints assistant text only
  curl -s https://api.anthropic.com/v1/messages \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "{\"model\": \"$MODEL\", \"max_tokens\": 256, \"messages\": $1}" \
    | jq -r '.content[] | select(.type == "text") | .text'
}

pause() { read -r -p ''; }

echo '$ chat "Hi! My name is Lukas."'
chat '[{"role":"user","content":"Hi! My name is Lukas. Reply in one short sentence."}]'
pause  # SCREENSHOT S2

echo '$ chat "What is my name?"          # fresh request'
chat '[{"role":"user","content":"What is my name? Reply in one short sentence."}]'
pause  # SCREENSHOT S3

echo '$ chat "... whole history pasted back by hand ..."'
chat '[{"role":"user","content":"Hi! My name is Lukas."},
       {"role":"assistant","content":"Hi Lukas, nice to meet you — what can I help you with?"},
       {"role":"user","content":"What is my name? Reply in one short sentence."}]'
# SCREENSHOT S4 (capture with the request body visible in the script line above)
