#!/usr/bin/env node
// S14/S15: render agent.py as one-screen code cards (fit by height).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(here, "png"), { recursive: true });

const code = readFileSync(join(here, "..", "agent.py"), "utf8").trimEnd().split("\n");
console.log(`agent.py: ${code.length} lines`);

// The skeleton: the five load-bearing lines S15 highlights.
const SKELETON = [
  "for turn in range(1, 6)",
  "resp = client.messages.create(",
  'if resp.stop_reason != "tool_use"',
  '"content": run_tool(block.name, block.input)',
  'messages.append({"role": "user", "content": results})',
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fs = Math.min(
  Math.floor(880 / (code.length * 1.5)),
  Math.floor(1700 / (Math.max(...code.map(l => l.length)) * 0.602)));

const render = (id, highlight) => {
  const body = code.map(l => {
    const hl = highlight && SKELETON.some(s => l.includes(s));
    return `<div class="${hl ? "hl" : ""}">${esc(l) || "&nbsp;"}</div>`;
  }).join("");
  const tmp = join(here, `.tmp-${id}.html`);
  writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body { width: 1920px; height: 1080px; display: flex; align-items: center;
           justify-content: center; background: transparent; }
    .card { width: max-content; max-width: 1820px; background: #fbfaf7; border: 2px solid #d8d4cc;
            border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,.16);
            padding: 36px 56px; }
    .card div { font: ${fs}px/1.5 "SF Mono", Menlo, monospace;
                color: ${highlight ? "#8a857c" : "#1a1916"}; white-space: pre; }
    .card div.hl { color: #1a1916; font-weight: 700; background: #fff3bf;
                   border-radius: 4px; }
  </style><body><div class="card">${body}</div></body>`);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--window-size=1920,1080",
    "--force-device-scale-factor=2", "--default-background-color=00000000",
    `--screenshot=${join(here, "png", id + ".png")}`, `file://${tmp}`], { stdio: "pipe" });
  rmSync(tmp);
  console.log(`png/${id}.png (font ${fs}px)`);
};

render("s14-code", false);
render("s15-code", true);
