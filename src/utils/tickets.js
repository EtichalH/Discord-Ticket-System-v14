import fs from "fs-extra";
import { fileURLToPath } from "url";
import config from "../config/config.js";

const file = fileURLToPath(new URL("../data/tickets.json", import.meta.url));

async function load() {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return { byChannel: {}, byUserOpen: {} };
  }
}

async function save(data) {
  await fs.ensureFile(file);
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function createRecord({ channelId, openerId, subject }) {
  const db = await load();
  db.byChannel[channelId] = {
    channelId,
    openerId,
    subject,
    claimedBy: null,
    locked: false,
    createdAt: Date.now(),
    closedAt: null
  };
  db.byUserOpen[openerId] ??= [];
  db.byUserOpen[openerId].push(channelId);
  await save(db);
}

export async function getRecord(channelId) {
  const db = await load();
  return db.byChannel[channelId] ?? null;
}

export async function setRecord(channelId, patch) {
  const db = await load();
  if (!db.byChannel[channelId]) return;
  db.byChannel[channelId] = { ...db.byChannel[channelId], ...patch };
  await save(db);
}

export async function removeRecord(channelId) {
  const db = await load();
  const rec = db.byChannel[channelId];
  if (rec) {
    db.byUserOpen[rec.openerId] = (db.byUserOpen[rec.openerId] ?? []).filter(
      id => id !== channelId
    );
    delete db.byChannel[channelId];
    await save(db);
  }
}

export async function countOpenFor(userId) {
  const db = await load();
  return (db.byUserOpen[userId] ?? []).length;
}
