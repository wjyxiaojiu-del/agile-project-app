import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

let initialized = false;

export async function ensureTables() {
  if (initialized) return;
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    );
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      number INTEGER NOT NULL,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      goal TEXT,
      status TEXT DEFAULT 'planned'
    );
    CREATE TABLE IF NOT EXISTS user_stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'B',
      story_points INTEGER DEFAULT 3,
      sprint_id INTEGER,
      status TEXT DEFAULT 'backlog',
      acceptance_criteria TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER,
      sprint_id INTEGER,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'backlog',
      sort_order INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS standup_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sprint_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      probability INTEGER DEFAULT 3,
      impact INTEGER DEFAULT 3,
      level TEXT DEFAULT 'medium',
      strategy TEXT,
      status TEXT DEFAULT 'monitoring',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      due_date TEXT,
      status TEXT DEFAULT 'pending',
      criteria TEXT
    );
  `);
  initialized = true;
}

export async function query(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return result.rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length ? rows[0] : null;
}

export async function run(sql, params = []) {
  const result = await client.execute({ sql, args: params });
  return { rows: [], rowCount: result.rowsAffected, lastInsertRowid: Number(result.lastInsertRowid) };
}

export function json(res, data, status = 200) {
  res.status(status).json(data);
}

export function error(res, msg = 'Not found', status = 404) {
  res.status(status).json({ error: msg });
}
