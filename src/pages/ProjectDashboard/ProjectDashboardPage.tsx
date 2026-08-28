import { useEffect, useState, type FormEvent } from 'react';
import type { Project } from '../../types/engine-agent-api';
import { ENGINE_TYPES, ENGINE_TYPE_LABELS, type EngineType } from '../../constants/engineTypes';
import { MAX_PROJECTS_PER_USER } from '../../constants/limits';
import { toDisplayErrorMessage } from '../../utils/errorMessage';
import './ProjectDashboard.css';

interface ProjectDashboardPageProps {
  onSelectProject: (project: Project) => void;
}

function ProjectDashboardPage({ onSelectProject }: ProjectDashboardPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectEngine, setNewProjectEngine] = useState<EngineType>(ENGINE_TYPES[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadProjects = async () => {
    const list = await window.engineAgentApi.projects.list();
    setProjects(list);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsCreating(true);
    try {
      await window.engineAgentApi.projects.create(newProjectName, newProjectEngine);
      setNewProjectName('');
      await loadProjects();
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, 'プロジェクト作成に失敗しました。'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    setErrorMessage(null);
    try {
      await window.engineAgentApi.projects.remove(projectId);
      await loadProjects();
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, 'プロジェクト削除に失敗しました。'));
    }
  };

  const isLimitReached = projects.length >= MAX_PROJECTS_PER_USER;

  return (
    <div className="project-dashboard">
      <h1>プロジェクト一覧</h1>
      <p className="project-dashboard__count">
        {projects.length} / {MAX_PROJECTS_PER_USER} 件
      </p>

      <form className="project-dashboard__create" onSubmit={handleCreate}>
        <label>
          プロジェクト名
          <input
            type="text"
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            disabled={isLimitReached}
            required
          />
        </label>
        <label>
          使用エンジン
          <select
            value={newProjectEngine}
            onChange={(event) => setNewProjectEngine(event.target.value as EngineType)}
            disabled={isLimitReached}
          >
            {ENGINE_TYPES.map((engineType) => (
              <option key={engineType} value={engineType}>
                {ENGINE_TYPE_LABELS[engineType]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={isCreating || isLimitReached}>
          {isCreating ? '作成中...' : '新規プロジェクト作成'}
        </button>
      </form>

      {isLimitReached && (
        <p className="project-dashboard__error">
          プロジェクトの保存上限（{MAX_PROJECTS_PER_USER}件）に達しています。新規作成するには既存のプロジェクトを削除してください。
        </p>
      )}
      {errorMessage && <p className="project-dashboard__error">{errorMessage}</p>}

      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id} className="project-list__item">
            <button
              type="button"
              className="project-list__open"
              onClick={() => onSelectProject(project)}
            >
              <span>{project.name}</span>
              <span className="project-list__engine">{ENGINE_TYPE_LABELS[project.engineType]}</span>
            </button>
            <button type="button" onClick={() => handleDelete(project.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectDashboardPage;
