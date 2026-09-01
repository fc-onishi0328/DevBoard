import { FormEvent, useState } from "react";
import { Project, Task, TaskStatus, TASK_STATUSES } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  project: Project;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  loadingTaskId: number | null;
  onCreateTask: (title: string, dueDate: string | null) => Promise<void>;
  onChangeTask: (taskId: number, status: TaskStatus, title: string, dueDate: string | null) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
}

export function TaskBoard({
  project,
  tasks,
  loading,
  error,
  loadingTaskId,
  onCreateTask,
  onChangeTask,
  onDeleteTask,
}: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    let postDueDate: string | null;
    if (dueDate === "") postDueDate = null
    else postDueDate = dueDate
    setSubmitting(true);
    try {
      await onCreateTask(title.trim(), postDueDate);
      setTitle("");
      setDueDate("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="board-panel">
      <div className="panel-header">
        <span className="prompt">$</span> tasks --project={project.name}
      </div>

      <form className="task-form" onSubmit={handleSubmit}>
        <input
          className="text-input"
          placeholder="new task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
        <input
          className="text-input"
          type="date"
          placeholder="due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={submitting}
        />
        <button
          className="btn btn-accent"
          type="submit"
          disabled={submitting || !title.trim()}
        >
          + add task
        </button>
      </form>

      {error && <div className="error-line">! {error}</div>}

      <div className="board-columns">
        {TASK_STATUSES.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.value);
          return (
            <div className="board-column" key={col.value}>
              <div className={`column-header column-${col.value.toLowerCase()}`}>
                [ {col.label} ]<span className="column-count">{columnTasks.length}</span>
              </div>

              {loading ? (
                <div className="muted-line">loading...</div>
              ) : columnTasks.length === 0 ? (
                <div className="muted-line">empty</div>
              ) : (
                <ul className="task-list">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      loading={loadingTaskId === task.id}
                      onChangeTask={onChangeTask}
                      onDeleteTask={onDeleteTask}
                    />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
