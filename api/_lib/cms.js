import crypto from "node:crypto";

const defaults = {
  owner: process.env.GITHUB_OWNER || "rajgohil28",
  repo: process.env.GITHUB_REPO || "portfolio",
  branch: process.env.GITHUB_BRANCH || "main",
  contentPath: process.env.CMS_CONTENT_PATH || "src/content/content.json",
};

export function config() { return defaults; }

export function cookies(req) {
  return Object.fromEntries((req.headers.cookie || "").split(";").map((part) => {
    const i = part.indexOf("=");
    return i < 0 ? [] : [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1))];
  }).filter((part) => part.length));
}

function signature(value) {
  const secret = process.env.CMS_SESSION_SECRET;
  if (!secret) throw new Error("CMS_SESSION_SECRET is not configured");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function makeSession(token, login) {
  const value = Buffer.from(JSON.stringify({ token, login, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${value}.${signature(value)}`;
}

export function session(req) {
  const raw = cookies(req).cms_session;
  if (!raw) return null;
  const [value, sig] = raw.split(".");
  if (!value || !sig) return null;
  const received = Buffer.from(sig);
  const expected = Buffer.from(signature(value));
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(value, "base64url").toString());
    return data.expires > Date.now() ? data : null;
  } catch { return null; }
}

export function sessionCookie(value) {
  return `cms_session=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`;
}

export function clearSessionCookie() {
  return "cms_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

export function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8").send(JSON.stringify(body));
}

export async function github(path, token, options = {}) {
  const { owner, repo } = config();
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || "GitHub request failed");
  return response.status === 204 ? null : response.json();
}

export async function ownerSession(req, res) {
  const active = session(req);
  if (!active) { json(res, 401, { error: "Sign in required" }); return null; }
  if (active.login !== config().owner) { json(res, 403, { error: "Unauthorized" }); return null; }
  return active;
}
