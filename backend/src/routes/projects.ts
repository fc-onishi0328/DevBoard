import { Router, Request, Response } from "express";
import { db } from "../db";
import { Project } from "../types";

export const projectsRouter = Router();

// GET /api/projects - プロジェクト一覧取得
projectsRouter.get("/", (_req: Request, res: Response) => {
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY createdAt DESC")
    .all() as Project[];
  res.json(projects);
});

// POST /api/projects - プロジェクト作成
projectsRouter.post("/", (req: Request, res: Response) => {
  const { name } = req.body ?? {};

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "name は必須です" });
  }

  const now = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO projects (name, createdAt, updatedAt) VALUES (?, ?, ?)"
    )
    .run(name.trim(), now, now);

  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(result.lastInsertRowid) as Project;

  res.status(201).json(project);
});

// GET /api/projects/:projectId/tasks は tasks ルーターで処理する
