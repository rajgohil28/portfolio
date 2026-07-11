import { config, json, ownerSession } from "../_lib/cms.js";
export default async function handler(req, res) {
  const active = await ownerSession(req, res);
  if (active) json(res, 200, { login: active.login, owner: config().owner });
}
