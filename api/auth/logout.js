import { clearSessionCookie, json } from "../_lib/cms.js";
export default function handler(_req, res) { res.setHeader("Set-Cookie", clearSessionCookie()); json(res, 200, { ok: true }); }
