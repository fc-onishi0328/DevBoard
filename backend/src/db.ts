import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// コンテナ内でDBファイルを永続化するディレクトリ
const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "devboard.sqlite");

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    title TEXT NOT NULL,
    dueDate TEXT,
    status TEXT NOT NULL DEFAULT 'TODO',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );
`);

const columns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;

function existsDueDate(column: { name: string }) {
  return column.name === "dueDate";
}

if (!columns.find(existsDueDate)) {
  db.exec(`ALTER TABLE tasks ADD COLUMN dueDate TEXT;`);
}