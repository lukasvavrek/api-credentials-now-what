#!/usr/bin/env node
// S20 "last 5% is the product": styled list as transparent PNG(s).
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(here, "png"), { recursive: true });

const rows = [
  ["permissions",     "what may run without asking"],
  ["context mgmt",    "what to forget, and when"],
  ["error recovery",  "the model <b>will</b> emit garbage"],
  ["subagents",       "a tool whose handler starts another loop"],
  ["mcp",             "someone else's tools, same JSON"],
];

const rowHtml = rows.map(([term, desc]) => `
  <div class="row">
    <div class="term">${term}</div>
    <div class="desc">${desc}</div>
  </div>`).join("");

const tmp = join(here, ".tmp-s20.html");
writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1920px; height: 840px; display: flex; align-items: center;
         justify-content: center; background: transparent; }
  .list { width: 1560px; }
  .row { display: flex; align-items: baseline; padding: 34px 8px;
         border-bottom: 2px solid #e4e0d8; }
  .row:last-child { border-bottom: none; }
  .term { flex: 0 0 480px; font: 700 44px "SF Mono", Menlo, monospace; color: #a0522d; }
  .desc { font: 38px/1.4 "SF Mono", Menlo, monospace; color: #4a463f; }
  .desc b { color: #1a1916; }
</style><body><div class="list">${rowHtml}</div></body>`);
execFileSync(CHROME, ["--headless", "--disable-gpu", "--window-size=1920,840",
  "--force-device-scale-factor=2", "--default-background-color=00000000",
  `--screenshot=${join(here, "png", "s20-last5.png")}`, `file://${tmp}`], { stdio: "pipe" });
rmSync(tmp);
console.log("png/s20-last5.png");
