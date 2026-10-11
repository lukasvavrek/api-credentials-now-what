#!/usr/bin/env node
// Logging proxy for the S19 receipts: point any Anthropic client at it via
// ANTHROPIC_BASE_URL=http://127.0.0.1:8899 and it prints each request's SHAPE
// (model, tool count, system size, turns) while relaying to the real API.
import http from "node:http";
import { writeFileSync } from "node:fs";

const UPSTREAM = "https://api.anthropic.com";
let n = 0;

http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);

  if (req.method === "POST" && body.length) {
    try {
      const j = JSON.parse(body.toString());
      const file = `/tmp/req-${String(++n).padStart(3, "0")}.json`;
      writeFileSync(file, JSON.stringify(j, null, 2));
      const sys = typeof j.system === "string"
        ? j.system
        : (j.system ?? []).map(b => b.text ?? "").join("");
      const tools = (j.tools ?? []).map(t => t.name).filter(Boolean);
      console.log([
        `── request #${n} (${req.url}) → ${file}`,
        `model      : ${j.model}`,
        `tools      : ${tools.length}  ${tools.slice(0, 6).join(", ")}${tools.length > 6 ? ", ..." : ""}`,
        `system     : ${sys.length} chars`,
        `messages   : ${(j.messages ?? []).length} turns`,
      ].join("\n"));
    } catch { /* non-JSON body: ignore */ }
  }

  const headers = { ...req.headers };
  delete headers.host;
  const upstream = await fetch(UPSTREAM + req.url, {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
  });
  const outHeaders = Object.fromEntries(upstream.headers);
  // fetch() already decompressed the body; forwarding these headers would lie
  delete outHeaders["content-encoding"];
  delete outHeaders["content-length"];
  res.writeHead(upstream.status, outHeaders);
  res.end(Buffer.from(await upstream.arrayBuffer()));
}).listen(8899, () => console.log("spyproxy on http://127.0.0.1:8899 → " + UPSTREAM));
