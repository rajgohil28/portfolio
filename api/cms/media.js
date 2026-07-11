import { config, github, json, ownerSession } from "../_lib/cms.js";

export default async function handler(req, res) {
  const active = await ownerSession(req, res); if (!active) return;
  if (req.method !== "PUT") return json(res, 405, { error: "Method not allowed" });
  const { filename, content } = req.body || {};
  if (!filename || !content || !/^[-a-zA-Z0-9_.]+$/.test(filename)) return json(res, 400, { error: "Provide a safe filename and base64 image content" });
  // Base64 is larger than the original file; keep below serverless request limits.
  if (Buffer.byteLength(content, "base64") > 3 * 1024 * 1024) return json(res, 413, { error: "Images must be 3 MB or smaller" });
  try {
    const { branch } = config();
    const path = `public/images/${filename}`;
    let sha;
    try { sha = (await github(`/contents/${path}?ref=${encodeURIComponent(branch)}`, active.token)).sha; } catch { /* New file. */ }
    await github(`/contents/${path}`, active.token, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `cms: upload ${filename}`, content, sha, branch }) });
    return json(res, 200, { url: `/images/${filename}` });
  } catch (error) { return json(res, 500, { error: error instanceof Error ? error.message : "Upload failed" }); }
}
