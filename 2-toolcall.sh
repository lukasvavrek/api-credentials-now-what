#!/bin/bash
# Demo 2 — the tool-use round trip, by hand (slides S7-S12).
# Run step by step; press Enter between screenshots.
set -euo pipefail
cd "$(dirname "$0")" && source ./env.sh

api() { curl -s https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" -d @-; }

READ_FILE_TOOL='{"name":"read_file","description":"Read a file from disk",
  "input_schema":{"type":"object","properties":{"path":{"type":"string"}},
  "required":["path"]}}'

pause() { read -r -p ''; }

# --- S7/S8: ask about a file, hand it the tool ------------------------------
echo '$ ask "What is in config.py?"  (tools: [read_file])'
RESP=$(api <<EOF
{"model": "$MODEL", "max_tokens": 1024,
 "tools": [$READ_FILE_TOOL],
 "messages": [{"role":"user","content":"What is in config.py? Summarize in one sentence."}]}
EOF
)
# THE HOLD FRAME (S8): stop_reason + the call, nothing else
echo "$RESP" | jq '{stop_reason,
                    tool_use: [.content[] | select(.type=="tool_use")
                      | {name, input}]}'
TC_ID=$(echo "$RESP" | jq -r '[.content[] | select(.type=="tool_use")][0].id')
ASSISTANT_CONTENT=$(echo "$RESP" | jq -c '.content')
pause

# --- S9: I am the runtime ----------------------------------------------------
echo '$ cat demo-repo/config.py          # I am the runtime'
cat demo-repo/config.py
FILE_CONTENT=$(jq -Rs . < demo-repo/config.py)
pause

# --- S10/S11: return the favor, get the answer -------------------------------
echo '$ resend conversation + tool_result'
api <<EOF | jq '{stop_reason, answer: [.content[] | select(.type=="text") | .text]}'
{"model": "$MODEL", "max_tokens": 1024,
 "tools": [$READ_FILE_TOOL],
 "messages": [
   {"role":"user","content":"What is in config.py? Summarize in one sentence."},
   {"role":"assistant","content":$ASSISTANT_CONTENT},
   {"role":"user","content":[{"type":"tool_result","tool_use_id":"$TC_ID","content":$FILE_CONTENT}]}]}
EOF
pause

# --- S12: the kicker — a tool that does not exist ----------------------------
echo '$ ask "Deploy to production."  (tools: [deploy_to_production])'
api <<EOF | jq '{stop_reason,
                 tool_use: [.content[] | select(.type=="tool_use") | {name, input}]}'
{"model": "$MODEL", "max_tokens": 1024,
 "tools": [{"name":"deploy_to_production",
   "description":"Deploy the current build to production",
   "input_schema":{"type":"object","properties":{"confirm":{"type":"boolean"}},"required":["confirm"]}}],
 "messages": [{"role":"user","content":"Deploy to production."}]}
EOF
echo
echo '# Nothing happened. Nothing CAN happen. There is no implementation.'
