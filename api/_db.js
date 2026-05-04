import { sql } from '@vercel/postgres';

let initialized = false;

export async function ensureTables() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sprints (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL,
      number INTEGER NOT NULL,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      goal TEXT,
      status TEXT DEFAULT 'planned'
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS user_stories (
      id SERIAL PRIMARY KEY,
      story_id TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'P1',
      story_points INTEGER DEFAULT 3,
      sprint_id INTEGER,
      status TEXT DEFAULT 'backlog',
      acceptance_criteria TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      story_id INTEGER,
      sprint_id INTEGER,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'backlog',
      sort_order INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS standup_logs (
      id SERIAL PRIMARY KEY,
      sprint_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      notes TEXT
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS risks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      probability INTEGER DEFAULT 3,
      impact INTEGER DEFAULT 3,
      level TEXT DEFAULT 'medium',
      strategy TEXT,
      status TEXT DEFAULT 'monitoring',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS milestones (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      due_date TEXT,
      status TEXT DEFAULT 'pending',
      criteria TEXT
    )
  `;
  initialized = true;
}

export async function query(text, params = []) {
  const result = await sql.query(text, params);
  return result.rows;
}

export async function queryOne(text, params = []) {
  const rows = await query(text, params);
  return rows.length ? rows[0] : null;
}

export async function run(text, params = []) {
  const result = await sql.query(text, params);
  return { rows: result.rows, rowCount: result.rowCount };
}

export function json(res, data, status = 200) {
  res.status(status).json(data);
}

export function error(res, msg = 'Not found', status = 404) {
  res.status(status).json({ error: msg });
}
