#!/usr/bin/env python3
"""An agent is a loop. That's it. That's the whole thing."""
import os, subprocess, sys
import anthropic

MODEL = os.environ.get("MODEL", "claude-opus-5")
TOOLS = [
    {"name": "read_file", "description": "Read a file from disk",
     "input_schema": {"type": "object", "properties": {"path": {"type": "string"}},
                      "required": ["path"]}},
    {"name": "bash", "description": "Run a shell command and return its output",
     "input_schema": {"type": "object", "properties": {"command": {"type": "string"}},
                      "required": ["command"]}},
]

def run_tool(name, args):
    if name == "read_file":
        return open(args["path"]).read()
    r = subprocess.run(args["command"], shell=True, capture_output=True, text=True, timeout=60)
    return (r.stdout + r.stderr)[-4000:] or "(no output)"

client = anthropic.Anthropic()
messages = [{"role": "user", "content": sys.argv[1]}]

for turn in range(1, 6):                                  # capped: stage safety
    resp = client.messages.create(
        model=MODEL, max_tokens=4096, tools=TOOLS,
        output_config={"effort": "low"},                  # snappy stage traces
        system="You are a coding agent. Use the tools to finish the task, then stop.",
        messages=messages)
    messages.append({"role": "assistant", "content": resp.content})
    print(f"--- turn {turn} (input_tokens={resp.usage.input_tokens})")
    if resp.stop_reason != "tool_use":                    # the load-bearing line
        print(next(b.text for b in resp.content if b.type == "text"))
        break
    results = []
    for block in resp.content:
        if block.type == "tool_use":
            print(f"    {block.name}({block.input})")
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": run_tool(block.name, block.input)})
    messages.append({"role": "user", "content": results})
