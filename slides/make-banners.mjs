#!/usr/bin/env node
// Card-image banners for the S5/S19 template cards (replaces stock photos).
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(here, "png"), { recursive: true });

const banners = [
  { id: "banner-model",   text: "text in → text out" },
  { id: "banner-api",     text: "POST /v1/messages" },
  { id: "banner-harness", text: 'while stop_reason == "tool_use"' },
];

for (const b of banners) {
  const fs = Math.max(48, Math.min(96, Math.floor(1000 / (b.text.length * 0.602))));
  const tmp = join(here, `.tmp-${b.id}.html`);
  writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>
    * { margin: 0; }
    body { width: 1600px; height: 1000px; display: flex; align-items: center;
           justify-content: center; background: #f1efe9; }
    div { font: ${fs}px/1.4 "SF Mono", Menlo, monospace; color: #1a1916; }
  </style><body><div>${b.text.replace(/</g, "&lt;")}</div></body>`);
  execFileSync(CHROME, [
    "--headless", "--disable-gpu", "--window-size=1600,1000",
    "--force-device-scale-factor=2",
    `--screenshot=${join(here, "png", b.id + ".png")}`, `file://${tmp}`,
  ], { stdio: "pipe" });
  rmSync(tmp);
  console.log(`png/${b.id}.png`);
}
