import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';
import { getNextDueDate } from '../src/lib/rruleHelper.js';
import { Task } from '../src/types.js';

const DB_FILE = path.join(process.cwd(), 'tasks.db');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Ensure tables exist
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      notes TEXT DEFAULT '',
      due_date TEXT,
      has_due_time INTEGER DEFAULT 0,
      project TEXT DEFAULT 'inbox',
      priority INTEGER DEFAULT 4,
      rrule TEXT,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      created_at TEXT NOT NULL,
      reminded INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  saveDb();
  return db;
}

export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function query(sql: string, params: any[] = []): Record<string, unknown>[] {
  if (!db) return [];
  const res = db.exec(sql, params);
  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  const values = res[0].values;
  return values.map(rowValues => {
    const row: Record<string, unknown> = {};
    columns.forEach((col, idx) => {
      row[col] = rowValues[idx];
    });
    return row;
  });
}

function parseRowToTask(row: Record<string, unknown>): Task {
  return {
    id: Number(row.id),
    title: String(row.title || ''),
    notes: String(row.notes || ''),
    due_date: row.due_date ? String(row.due_date) : null,
    has_due_time: Boolean(row.has_due_time),
    project: String(row.project || 'inbox'),
    priority: Number(row.priority || 4),
    rrule: row.rrule ? String(row.rrule) : null,
    completed: Boolean(row.completed),
    completed_at: row.completed_at ? String(row.completed_at) : null,
    created_at: String(row.created_at || new Date().toISOString()),
    reminded: Boolean(row.reminded),
  };
}

export async function getAllTasks(): Promise<Task[]> {
  await getDb();
  const rows = query(`SELECT * FROM tasks ORDER BY completed ASC, priority ASC, due_date ASC, id DESC`);
  return rows.map(parseRowToTask);
}

export async function getTaskById(id: number): Promise<Task | null> {
  await getDb();
  const rows = query(`SELECT * FROM tasks WHERE id = ?`, [id]);
  if (rows.length > 0) {
    return parseRowToTask(rows[0]);
  }
  return null;
}

export async function addTask(taskData: Partial<Task>): Promise<Task> {
  const database = await getDb();
  const title = taskData.title || 'Untitled Task';
  const notes = taskData.notes || '';
  const due_date = taskData.due_date || null;
  const has_due_time = taskData.has_due_time ? 1 : 0;
  const project = taskData.project ? taskData.project.toLowerCase() : 'inbox';
  const priority = taskData.priority || 4;
  const rrule = taskData.rrule || null;
  const created_at = new Date().toISOString();

  database.run(
    `INSERT INTO tasks (title, notes, due_date, has_due_time, project, priority, rrule, completed, created_at, reminded)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 0)`,
    [title, notes, due_date, has_due_time, project, priority, rrule, created_at]
  );

  saveDb();

  // Get inserted task
  const res = database.exec(`SELECT last_insert_rowid() as id`);
  const id = res[0].values[0][0] as number;
  return (await getTaskById(id))!;
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task | null> {
  const database = await getDb();
  const existing = await getTaskById(id);
  if (!existing) return null;

  const title = updates.title !== undefined ? updates.title : existing.title;
  const notes = updates.notes !== undefined ? updates.notes : existing.notes;
  const due_date = updates.due_date !== undefined ? updates.due_date : existing.due_date;
  const has_due_time = updates.has_due_time !== undefined ? (updates.has_due_time ? 1 : 0) : (existing.has_due_time ? 1 : 0);
  const project = updates.project !== undefined ? updates.project.toLowerCase() : existing.project;
  const priority = updates.priority !== undefined ? updates.priority : existing.priority;
  const rrule = updates.rrule !== undefined ? updates.rrule : existing.rrule;
  const completed = updates.completed !== undefined ? (updates.completed ? 1 : 0) : (existing.completed ? 1 : 0);
  const completed_at = updates.completed ? new Date().toISOString() : (updates.completed === false ? null : existing.completed_at);
  const reminded = updates.reminded !== undefined ? (updates.reminded ? 1 : 0) : (existing.reminded ? 1 : 0);

  database.run(
    `UPDATE tasks SET title = ?, notes = ?, due_date = ?, has_due_time = ?, project = ?, priority = ?, rrule = ?, completed = ?, completed_at = ?, reminded = ? WHERE id = ?`,
    [title, notes, due_date, has_due_time, project, priority, rrule, completed, completed_at, reminded, id]
  );

  saveDb();
  return getTaskById(id);
}

export async function completeTask(id: number): Promise<{ completedTask: Task; nextTask: Task | null }> {
  const database = await getDb();
  const existing = await getTaskById(id);
  if (!existing) {
    throw new Error('Task not found');
  }

  const nowIso = new Date().toISOString();

  // Mark current completed
  database.run(`UPDATE tasks SET completed = 1, completed_at = ? WHERE id = ?`, [nowIso, id]);
  saveDb();

  const completedTask = (await getTaskById(id))!;
  let nextTask: Task | null = null;

  // Handle recurring task logic!
  if (existing.rrule) {
    const { due_date: nextDueDate, has_due_time: nextHasTime } = getNextDueDate(existing.due_date, existing.rrule);
    nextTask = await addTask({
      title: existing.title,
      notes: existing.notes,
      due_date: nextDueDate,
      has_due_time: nextHasTime,
      project: existing.project,
      priority: existing.priority,
      rrule: existing.rrule,
    });
  }

  return { completedTask, nextTask };
}

export async function deleteTask(id: number): Promise<boolean> {
  const database = await getDb();
  database.run(`DELETE FROM tasks WHERE id = ?`, [id]);
  saveDb();
  return true;
}

export async function getProjects(): Promise<{ name: string; count: number }[]> {
  await getDb();
  const rows = query(`SELECT project, COUNT(*) as count FROM tasks WHERE completed = 0 GROUP BY project ORDER BY project ASC`);
  const projects: { name: string; count: number }[] = rows.map(row => ({
    name: String(row.project || 'inbox'),
    count: Number(row.count || 0),
  }));

  // Ensure 'inbox' exists in output if missing
  if (!projects.some(p => p.name === 'inbox')) {
    projects.unshift({ name: 'inbox', count: 0 });
  }

  return projects;
}

export async function getSetting(key: string, defaultValue = ''): Promise<string> {
  await getDb();
  const rows = query(`SELECT value FROM settings WHERE key = ?`, [key]);
  if (rows.length > 0) {
    return String(rows[0].value || '');
  }
  return defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await getDb();
  database.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  saveDb();
}
