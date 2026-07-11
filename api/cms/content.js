import { config, github, json, ownerSession } from "../_lib/cms.js";

export default async function handler(req, res) {
  const active = await ownerSession(req, res); if (!active) return;
  try {
    const { contentPath, branch } = config();
    const file = await github(`/contents/${contentPath}?ref=${encodeURIComponent(branch)}`, active.token);
    const text = Buffer.from(file.content, "base64").toString("utf8");
    if (req.method === "GET") return json(res, 200, { content: JSON.parse(text), sha: file.sha });
    if (req.method !== "PUT") return json(res, 405, { error: "Method not allowed" });
    const { content, sha, message } = req.body || {};
    if (!content || !sha) return json(res, 400, { error: "Content and its current sha are required" });
    const encoded = Buffer.from(`${JSON.stringify(content, null, 2)}\n`).toString("base64");
    const updated = await github(`/contents/${contentPath}`, active.token, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message || "cms: update portfolio content", content: encoded, sha, branch }),
    });
    return json(res, 200, { sha: updated.content.sha, commit: updated.commit.html_url });
  } catch (error) { return json(res, 500, { error: error instanceof Error ? error.message : "Content request failed" }); }
}
