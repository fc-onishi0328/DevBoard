import { FormEvent, useState } from "react";
import { Task, TaskStatus, TASK_STATUSES } from "../types";

interface Props {
  task: Task;
  loading: boolean;
  onChangeTask: (taskId: number, status: TaskStatus, title: string, dueDate: string | null) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
}
export function TaskCard({
  task,
  loading,
  onChangeTask,
  onDeleteTask,
}: Props) {
    const [localTitle, setLocalTitle] = useState(task.title);
    const [localDueDate, setLocalDueDate] = useState(task.dueDate ?? "");
    return (
        <li className="task-card">
            <div className="task-title-button">
                <div className="task-title">
                    <input
                        className="text-input"
                        type="text"
                        placeholder="title"
                        value={localTitle}
                        onChange={(e) =>
                            setLocalTitle(e.target.value)
                        }
                        onBlur={() => { onChangeTask(task.id, task.status, localTitle, localDueDate || null) }}
                        disabled={loading}
                    />
                </div>
                <div className="task-delete">
                    <button
                        className="btn btn-danger"
                        onClick={() => onDeleteTask(task.id)}
                        title="delete task"
                        disabled={loading}
                    >
                        ✕
                    </button>
                </div>
            </div>
            <div className="task-actions">
                <select
                    className="status-select"
                    value={task.status}
                    onChange={(e) =>
                        onChangeTask(task.id, e.target.value as TaskStatus, localTitle, localDueDate || null)
                    }
                    disabled={loading}
                >
                    {TASK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                        {s.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="task-due-date">
                <input
                    className="text-input"
                    type="date"
                    placeholder="due date"
                    value={localDueDate}
                    onChange={(e) =>
                        setLocalDueDate(e.target.value)
                    }
                    onBlur={() => { onChangeTask(task.id, task.status, localTitle, localDueDate || null) }}
                    disabled={loading}
                />
            </div>
        </li>
    )
}