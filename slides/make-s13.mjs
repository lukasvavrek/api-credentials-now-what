#!/usr/bin/env node
// S13 "the click" assets: transparent PNGs to stack on a template slide.
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(here, "png"), { recursive: true });

const assets = [
  { id: "s13-loop", w: 1920, h: 360, html: `
      <div style='font: 86px/1.2 "SF Mono", Menlo, monospace; color: #1a1916;'>
        <span style="color:#a0522d">while</span> stop_reason == <span style="color:#1f6f43">"tool_use"</span>:
      </div>` },
  { id: "s13-vocab", w: 1920, h: 160, html: `
      <div style='font: 34px/1.2 "SF Mono", Menlo, monospace; color: #b0aba1; white-space: nowrap;'>
        end_turn &middot; <span style="color:#1a1916;font-weight:700">tool_use</span> &middot; max_tokens &middot; stop_sequence &middot; pause_turn &middot; refusal
      </div>` },
];

for (const a of assets) {
  const tmp = join(here, `.tmp-${a.id}.html`);
  writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>
    * { margin: 0; } body { width: ${a.w}px; height: ${a.h}px; display: flex;
    align-items: center; justify-content: center; background: transparent; }
  </style><body>${a.html}</body>`);
  execFileSync(CHROME, ["--headless", "--disable-gpu",
    `--window-size=${a.w},${a.h}`, "--force-device-scale-factor=2",
    "--default-background-color=00000000",
    `--screenshot=${join(here, "png", a.id + ".png")}`, `file://${tmp}`], { stdio: "pipe" });
  rmSync(tmp);
  console.log(`png/${a.id}.png`);
}
