import { useEffect, useState } from "react";
import { api } from "./api";
import { Project, Task, TaskStatus } from "./types";
import { ProjectList } from "./components/ProjectList";
import { TaskBoard } from "./components/TaskBoard";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const loadProjects = async () => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const data = await api.getProjects();
      setProjects(data);
      // 初回ロード時、まだ何も選択されていなければ先頭を選択
      if (data.length > 0 && selectedProjectId === null) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err) {
      setProjectsError(
        err instanceof Error ? err.message : "プロジェクトの取得に失敗しました"
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadTasks = async (projectId: number) => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await api.getTasks(projectId);
      setTasks(data);
    } catch (err) {
      setTasksError(
        err instanceof Error ? err.message : "タスクの取得に失敗しました"
      );
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProjectId !== null) {
      loadTasks(selectedProjectId);
    } else {
      setTasks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const handleCreateProject = async (name: string) => {
    const project = await api.createProject(name);
    setProjects((prev) => [project, ...prev]);
    setSelectedProjectId(project.id);
  };

  const handleCreateTask = async (title: string, dueDate: string | null) => {
    if (selectedProjectId === null) return;
    const task = await api.createTask(selectedProjectId, title, dueDate);
    setTasks((prev) => [...prev, task]);
  };

  const handleChangeTask = async (taskId: number, status: TaskStatus, title: string, dueDate: string | null) => {
    setLoadingTaskId(taskId);
    try {
      const updated = await api.updateTask(taskId, status, title, dueDate);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } finally {
      setLoadingTaskId(null)
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    setLoadingTaskId(taskId);
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } finally {
      setLoadingTaskId(null)
    }
  };

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="logo-bracket">[</span>
        DevBoard
        <span className="logo-bracket">]</span>
        <span className="logo-sub">// task tracker for small builds</span>
      </header>

      <main className="app-main">
        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          loading={projectsLoading}
          error={projectsError}
          onSelect={setSelectedProjectId}
          onCreate={handleCreateProject}
        />

        {selectedProject ? (
          <TaskBoard
            project={selectedProject}
            tasks={tasks}
            loading={tasksLoading}
            error={tasksError}
            loadingTaskId={loadingTaskId}
            onCreateTask={handleCreateTask}
            onChangeTask={handleChangeTask}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <section className="board-panel">
            <div className="muted-line">
              select or create a project to see its tasks.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
