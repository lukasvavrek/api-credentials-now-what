#!/usr/bin/env node
// S22 (close) + S23 (repo) as complete standalone slide assets.
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(join(here, "png"), { recursive: true });

const shot = (id, html) => {
  const tmp = join(here, `.tmp-${id}.html`);
  writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body { width: 1920px; height: 1080px; display: flex; flex-direction: column;
           align-items: center; justify-content: center; background: transparent;
           font-family: "SF Mono", Menlo, monospace; }
  </style><body>${html}</body>`);
  execFileSync(CHROME, ["--headless", "--disable-gpu", "--window-size=1920,1080",
    "--force-device-scale-factor=2", "--default-background-color=00000000",
    `--screenshot=${join(here, "png", id + ".png")}`, `file://${tmp}`], { stdio: "pipe" });
  rmSync(tmp);
  console.log(`png/${id}.png`);
};

shot("s22-close", `
  <div style="font-size:72px; color:#1a1916;">You have API credentials.</div>
  <div style="font-size:120px; font-weight:700; color:#a0522d; margin-top:48px;">Now what?</div>
`);

const qr = readFileSync(join(here, "png", "s23-qr.png")).toString("base64");
shot("s23-repo", `
  <img src="data:image/png;base64,${qr}" style="width:560px; height:560px;">
  <div style="font-size:44px; color:#1a1916; margin-top:56px;">github.com/lukasvavrek/api-credentials-now-what</div>
  <div style="font-size:30px; color:#8a857c; margin-top:28px;">the 42 lines &middot; the capture scripts &middot; the spy proxy &middot; these slides</div>
`);
