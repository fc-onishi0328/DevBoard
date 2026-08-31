export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Project {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  dueDate: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
