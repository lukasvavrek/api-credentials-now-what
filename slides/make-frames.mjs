#!/usr/bin/env node
// Renders frames.json into crisp terminal-card PNGs for Keynote.
// Usage: node make-frames.mjs          -> writes slides/png/<id>.png
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const frames = JSON.parse(readFileSync(join(here, "frames.json"), "utf8"));
mkdirSync(join(here, "png"), { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const line = ([type, text]) => {
  if (type === "gap") return `<div class="gap"></div>`;
  if (type === "cmd") return `<div class="cmd"><span class="p">$ </span>${esc(text)}</div>`;
  if (type === "cont") return `<div class="cmd">${esc(text)}</div>`;
  if (type === "hl") return `<div class="cmd hl">${esc(text)}</div>`;
  return `<div class="out">${esc(text)}</div>`;
};

// Auto-fit: shrink the font until the longest line fits the card's text width.
// SF Mono/Menlo advance width is ~0.602em per character.
const fontSize = (f) => {
  const maxLen = Math.max(...f.lines.map(([t, s]) => (s || "").length + (t === "cmd" ? 2 : 0)));
  return Math.max(24, Math.min(40, Math.floor(1416 / (maxLen * 0.602))));
};

const html = (f) => `<!doctype html><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1920px; height: 1080px; display: flex; align-items: center;
         justify-content: center; background: transparent; }
  .card { width: 1560px; background: #fbfaf7; border: 2px solid #d8d4cc;
          border-radius: 24px; box-shadow: 0 24px 60px rgba(0,0,0,.18);
          padding: 0 0 56px 0; overflow: hidden; }
  .bar { display: flex; gap: 16px; padding: 28px 36px; }
  .dot { width: 24px; height: 24px; border-radius: 50%; }
  .d1 { background: #ff5f57; } .d2 { background: #febc2e; } .d3 { background: #28c840; }
  .body { padding: 24px 72px 0; font: ${fontSize(f)}px/1.65 "SF Mono", Menlo, monospace; }
  .cmd { color: #6b675f; white-space: pre; }
  .p { color: #b0aba1; }
  .hl { background: #fff3bf; border-radius: 8px; }
  .out { color: #1a1916; font-weight: 700; white-space: pre; }
  .gap { height: 40px; }
</style><body><div class="card">
  <div class="bar"><div class="dot d1"></div><div class="dot d2"></div><div class="dot d3"></div></div>
  <div class="body">${f.lines.map(line).join("\n")}</div>
</div></body>`;

for (const f of frames) {
  const tmp = join(here, `.tmp-${f.id}.html`);
  writeFileSync(tmp, html(f));
  execFileSync(CHROME, [
    "--headless", "--disable-gpu",
    "--window-size=1920,1080",
    "--force-device-scale-factor=2",
    "--default-background-color=00000000",
    `--screenshot=${join(here, "png", f.id + ".png")}`,
    `file://${tmp}`,
  ], { stdio: "pipe" });
  rmSync(tmp);
  console.log(`png/${f.id}.png`);
}
