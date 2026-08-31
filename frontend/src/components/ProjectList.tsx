import { FormEvent, useState } from "react";
import { Project } from "../types";

interface Props {
  projects: Project[];
  selectedProjectId: number | null;
  loading: boolean;
  error: string | null;
  onSelect: (projectId: number) => void;
  onCreate: (name: string) => Promise<void>;
}

export function ProjectList({
  projects,
  selectedProjectId,
  loading,
  error,
  onSelect,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onCreate(name.trim());
      setName("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="project-panel">
      <div className="panel-header">
        <span className="prompt">$</span> projects
      </div>

      <form className="project-form" onSubmit={handleSubmit}>
        <input
          className="text-input"
          placeholder="new-project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        <button
          className="btn btn-accent"
          type="submit"
          disabled={submitting || !name.trim()}
        >
          + create
        </button>
      </form>

      {error && <div className="error-line">! {error}</div>}

      {loading ? (
        <div className="muted-line">loading...</div>
      ) : projects.length === 0 ? (
        <div className="muted-line">
          no projects yet — create one above to get started.
        </div>
      ) : (
        <ul className="project-list">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                className={
                  "project-item" +
                  (p.id === selectedProjectId ? " project-item-active" : "")
                }
                onClick={() => onSelect(p.id)}
              >
                <span className="project-caret">
                  {p.id === selectedProjectId ? ">" : " "}
                </span>
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
