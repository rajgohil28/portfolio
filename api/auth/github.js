import crypto from "node:crypto";
import { json } from "../_lib/cms.js";

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return json(res, 500, { error: "GITHUB_CLIENT_ID is not configured" });
  const state = crypto.randomBytes(24).toString("hex");
  res.setHeader("Set-Cookie", `cms_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=repo&state=${state}`);
}
