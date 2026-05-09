import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'data.db');

let db = null;
let saveTimeout = null;
let dirty = false;

export async function initDB() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  createTables();
  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      number INTEGER NOT NULL,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      goal TEXT,
      status TEXT DEFAULT 'planned',
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  db.run(`
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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (sprint_id) REFERENCES sprints(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER,
      sprint_id INTEGER,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'backlog',
      sort_order INTEGER DEFAULT 0,
      due_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (story_id) REFERENCES user_stories(id),
      FOREIGN KEY (sprint_id) REFERENCES sprints(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS standup_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sprint_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      yesterday TEXT,
      today TEXT,
      blockers TEXT,
      notes TEXT,
      FOREIGN KEY (sprint_id) REFERENCES sprints(id)
    )
  `);
  db.run(`
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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      due_date TEXT,
      status TEXT DEFAULT 'pending',
      criteria TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS literature (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      authors TEXT,
      journal TEXT,
      year INTEGER,
      doi TEXT,
      abstract TEXT,
      notes TEXT,
      tags TEXT,
      rating INTEGER DEFAULT 0,
      status TEXT DEFAULT 'unread',
      file_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      mentor_name TEXT,
      meeting_date TEXT NOT NULL,
      topic TEXT,
      summary TEXT,
      action_items TEXT,
      next_meeting TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
}

// Debounced save: batch multiple writes within 500ms into a single disk write
export function saveDB() {
  dirty = true;
  if (saveTimeout) return;
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    if (dirty && db) {
      const data = db.export();
      writeFileSync(DB_PATH, Buffer.from(data));
      dirty = false;
    }
  }, 500);
}

// Force immediate save (for shutdown, batch operations, etc.)
export function flushDB() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  if (dirty && db) {
    const data = db.export();
    writeFileSync(DB_PATH, Buffer.from(data));
    dirty = false;
  }
}

export function getDB() {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

// Helper: run query and return all rows as array of objects
export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run query and return first row as object
export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length ? rows[0] : null;
}

// Helper: run insert/update/delete
export function run(sql, params = []) {
  db.run(sql, params);
  saveDB();
  return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
}
