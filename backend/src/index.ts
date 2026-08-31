import express from "express";
import cors from "cors";
import "./db"; // 起動時にテーブルを初期化
import { projectsRouter } from "./routes/projects";
import { projectTasksRouter, tasksRouter } from "./routes/tasks";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

// ルーティング
app.use("/api/projects", projectsRouter);
app.use("/api/projects/:projectId/tasks", projectTasksRouter);
app.use("/api/tasks", tasksRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// エラーハンドリング（想定外の例外を拾う）
app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "サーバー内部でエラーが発生しました" });
  }
);

app.listen(PORT, () => {
  console.log(`DevBoard API listening on http://localhost:${PORT}`);
});
