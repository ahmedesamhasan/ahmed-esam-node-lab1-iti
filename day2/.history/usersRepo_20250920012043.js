// usersRepo.js
import fs from 'fs/promises';

const DB_PATH = './users.json';

async function load() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    const data = raw?.trim() ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [data];
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    // لو JSON بايظ رجّع مصفوفة فاضية
    if (e.name === 'SyntaxError') return [];
    throw e;
  }
}

async function save(list) {
  await fs.writeFile(DB_PATH, JSON.stringify(list, null, 2));
}

function nextId(list) {
  return list.reduce((mx, u) => Math.max(mx, Number(u.id) || 0), 0) + 1;
}

export async function getAll() {
  return load();
}

export async function getOne(id) {
  const list = await load();
  return list.find((u) => Number(u.id) === Number(id)) || null;
}

export async function create(name) {
  const list = await load();
  const user = { id: nextId(list), Name: String(name).trim() };
  list.push(user);
  await save(list);
  return user;
}

export async function update(id, name) {
  const list = await load();
  const i = list.findIndex((u) => Number(u.id) === Number(id));
  if (i === -1) return null;
  list[i] = { ...list[i], Name: String(name).trim() };
  await save(list);
  return list[i];
}

export async function removeOne(id) {
  const list = await load();
  const next = list.filter((u) => Number(u.id) !== Number(id));
  if (next.length === list.length) return false;
  await save(next);
  return true;
}
