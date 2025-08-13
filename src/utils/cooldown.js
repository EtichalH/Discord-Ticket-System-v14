import fs from "fs-extra";
import { fileURLToPath } from "url";

const PATH = fileURLToPath(new URL("../data/cooldowns.json", import.meta.url));

async function load() {
  try { return JSON.parse(await fs.readFile(PATH, "utf8")); }
  catch { return {}; }
}

async function save(data) {
  await fs.ensureFile(PATH);
  await fs.writeFile(PATH, JSON.stringify(data, null, 2));
}

export async function isOnCooldown(userId, key, ms) {
  const store = await load();
  const now = Date.now();
  const until = (store[userId]?.[key] ?? 0);
  return now < until ? until - now : 0;
}

export async function putCooldown(userId, key, ms) {
  const store = await load();
  const now = Date.now();
  store[userId] ??= {};
  store[userId][key] = now + ms;
  await save(store);
}

export async function deleteCooldown(userId) {
  const store = await load();
  if (store[userId]) delete store[userId];
  await save(store);
}
