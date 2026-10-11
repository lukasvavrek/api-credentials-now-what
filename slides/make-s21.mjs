#!/usr/bin/env node
// S21 "loops all the way down": one diagram, transparent PNG.
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(here, "png"), { recursive: true });

const products = [
  ["Claude Code", 0], ["Cursor", 60], ["Copilot agent mode", 120],
  ["LangChain / LangGraph", 180], ["OpenAI Agents SDK", 240], ["your future internal tool", 300],
];
const cx = 960, cy = 540, rOrbit = 430;
const labels = products.map(([name, deg]) => {
  const a = (deg - 90) * Math.PI / 180;
  const x = cx + rOrbit * Math.cos(a), y = cy + rOrbit * Math.sin(a);
  const anchor = Math.abs(Math.cos(a)) < 0.3 ? "middle" : (Math.cos(a) > 0 ? "start" : "end");
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle"
    font-family="SF Mono, Menlo, monospace" font-size="34" fill="#1a1916">${name}</text>`;
}).join("\n");

const html = `<!doctype html><meta charset="utf-8">
<body style="margin:0;width:1920px;height:1080px;background:transparent">
<svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#a0522d"/>
    </marker>
  </defs>
  <!-- the loop ring -->
  <circle cx="${cx}" cy="${cy}" r="250" fill="none" stroke="#a0522d" stroke-width="5"
          stroke-dasharray="18 14" />
  <path d="M ${cx + 250} ${cy} a 250 250 0 0 1 -2 10" fill="none" stroke="#a0522d"
        stroke-width="5" marker-end="url(#arr)"/>
  <!-- ring labels -->
  <text x="${cx}" y="${cy - 282}" text-anchor="middle" font-family="SF Mono, Menlo, monospace"
        font-size="30" fill="#a0522d">while stop_reason == "tool_use"</text>
  <text x="${cx}" y="${cy + 300}" text-anchor="middle" font-family="SF Mono, Menlo, monospace"
        font-size="30" fill="#a0522d">tools</text>
  <!-- the model box -->
  <rect x="${cx - 220}" y="${cy - 70}" width="440" height="140" rx="20"
        fill="#fbfaf7" stroke="#d8d4cc" stroke-width="3"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        font-family="SF Mono, Menlo, monospace" font-size="36" fill="#1a1916">text in → text out</text>
  ${labels}
</svg></body>`;

const tmp = join(here, ".tmp-s21.html");
writeFileSync(tmp, html);
execFileSync(CHROME, ["--headless", "--disable-gpu", "--window-size=1920,1080",
  "--force-device-scale-factor=2", "--default-background-color=00000000",
  `--screenshot=${join(here, "png", "s21-loops.png")}`, `file://${tmp}`], { stdio: "pipe" });
rmSync(tmp);
console.log("png/s21-loops.png");
