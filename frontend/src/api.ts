import { Project, Task, TaskStatus } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `リクエストに失敗しました (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  getProjects: () => request<Project[]>("/api/projects"),

  createProject: (name: string) =>
    request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getTasks: (projectId: number) =>
    request<Task[]>(`/api/projects/${projectId}/tasks`),

  createTask: (projectId: number, title: string, dueDate: string | null) =>
    request<Task>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title, dueDate }),
    }),

  updateTask: (taskId: number, status: TaskStatus, title: string, dueDate: string | null) => 
    request<Task>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status, title, dueDate }),
    }),

  deleteTask: (taskId: number) =>
    request<void>(`/api/tasks/${taskId}`, { method: "DELETE" }),
};
