import { clearSessionCookie, cookies, json, makeSession, sessionCookie, config } from "../_lib/cms.js";

export default async function handler(req, res) {
  const { code, state } = req.query;
  if (!code || !state || state !== cookies(req).cms_oauth_state) return json(res, 400, { error: "Invalid OAuth state" });
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
    });
    const { access_token: token, error_description: error } = await tokenResponse.json();
    if (!token) throw new Error(error || "GitHub did not return an access token");
    const user = await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }).then((r) => r.json());
    if (user.login !== config().owner) {
      res.setHeader("Set-Cookie", [clearSessionCookie(), "cms_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"]);
      return res.redirect("/admin?error=unauthorized");
    }
    res.setHeader("Set-Cookie", [sessionCookie(makeSession(token, user.login)), "cms_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"]);
    return res.redirect("/admin");
  } catch (error) { return json(res, 500, { error: error instanceof Error ? error.message : "OAuth failed" }); }
}
