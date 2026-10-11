# "You have API credentials, now what?"

**[The slides (PDF)](talk.pdf)** — plus everything below that produced them.

Everything needed to capture the deck frames. Anthropic Messages API
(`POST /v1/messages`) — matches the abstract and the slide field names
(stop_reason, tool_use, tool_result) exactly.

## Setup (once)

```sh
cp env.sh.example env.sh   # add your key + model
pip install anthropic pytest
chmod +x 1-stateless.sh 2-toolcall.sh 3-agent.sh
```

## The demos

| Script | Feeds slides | What it does |
|---|---|---|
| `1-stateless.sh` | S2-S4 | Amnesia gag: fresh call forgets, pasted history "remembers". Press Enter between screenshots. |
| `2-toolcall.sh` | S7-S12 | Tool round trip by hand: HOLD frame (`stop_reason: "tool_use"`), cat the file, `tool_result` back, answer. Ends with the `deploy_to_production` kicker. |
| `3-agent.sh` | S16-S18 | Resets the planted bug, runs `agent.py` on `demo-repo/`. Screenshot each turn. Rerun for the best take. |

`agent.py` is the hero artifact (~40 lines, slides S14-S15).

## Capture rules

Light theme, ~26pt, <=80 columns, bare `$ ` prompt, scrollback cleared,
DND on. jq-filtered output only; no key in any frame; rotate the key after
the capture session.
