import { Router, Request, Response } from "express";
import { db } from "../db";
import { Task, TASK_STATUSES, TaskStatus } from "../types";

// プロジェクトに紐づくタスクの一覧取得・作成
// mergeParams: true で親ルーターの :projectId を受け取れるようにする
export const projectTasksRouter = Router({ mergeParams: true });

// GET /api/projects/:projectId/tasks
projectTasksRouter.get("/", (req: Request, res: Response) => {
  const { projectId } = req.params;

  const project = db
    .prepare("SELECT id FROM projects WHERE id = ?")
    .get(projectId);
  if (!project) {
    return res.status(404).json({ error: "プロジェクトが見つかりません" });
  }

  const tasks = db
    .prepare("SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt ASC")
    .all(projectId) as Task[];
  res.json(tasks);
});

// POST /api/projects/:projectId/tasks
projectTasksRouter.post("/", (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, dueDate } = req.body ?? {};

  const project = db
    .prepare("SELECT id FROM projects WHERE id = ?")
    .get(projectId);
  if (!project) {
    return res.status(404).json({ error: "プロジェクトが見つかりません" });
  }

  if (typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "title は必須です" });
  }

  function isHyphenDate(str: string): boolean {
    // YYYY-MM-DD 形式にマッチする正規表現（例: 2026-06-07）
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(str);
  }

  if (dueDate != null && !isHyphenDate(dueDate)) {
    return res.status(400).json({ error: "dueDate の記載方法が誤っています(yyyy-mm-dd)" })
  }

  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO tasks (projectId, title, dueDate, status, createdAt, updatedAt)
       VALUES (?, ?, ?, 'TODO', ?, ?)`
    )
    .run(projectId, title.trim(), dueDate || null, now, now);

  const task = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid) as Task;

  res.status(201).json(task);
});

// タスク単体の更新・削除（/api/tasks/:taskId）
export const tasksRouter = Router();

// PATCH /api/tasks/:taskId
tasksRouter.patch("/:taskId", (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { title, status, dueDate } = req.body ?? {};

  const existing = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(taskId) as Task | undefined;

  if (!existing) {
    return res.status(404).json({ error: "タスクが見つかりません" });
  }

  if (status !== undefined && !TASK_STATUSES.includes(status as TaskStatus)) {
    return res.status(400).json({
      error: `status は ${TASK_STATUSES.join(", ")} のいずれかである必要があります`,
    });
  }
  let updateDueDate: string | null;
  if (dueDate === undefined) {
    updateDueDate = existing.dueDate
  } else {
    updateDueDate = dueDate
  }

  function isHyphenDate(str: string): boolean {
    // YYYY-MM-DD 形式にマッチする正規表現（例: 2026-06-07）
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(str);
  }

  if (updateDueDate != null && !isHyphenDate(updateDueDate)) {
    return res.status(400).json({ error: "dueDate の記載方法が誤っています(yyyy-mm-dd)" })
  }

  const nextTitle =
    typeof title === "string" && title.trim().length > 0
      ? title.trim()
      : existing.title;
  const nextStatus = (status as TaskStatus) ?? existing.status;
  const now = new Date().toISOString();

  db.prepare(
    "UPDATE tasks SET title = ?, dueDate = ?, status = ?, updatedAt = ? WHERE id = ?"
  ).run(nextTitle, updateDueDate, nextStatus, now, taskId);

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);
  res.json(updated);
});

// DELETE /api/tasks/:taskId
tasksRouter.delete("/:taskId", (req: Request, res: Response) => {
  const { taskId } = req.params;

  const existing = db.prepare("SELECT id FROM tasks WHERE id = ?").get(taskId);
  if (!existing) {
    return res.status(404).json({ error: "タスクが見つかりません" });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);
  res.status(204).send();
});
