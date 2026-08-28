import { useState } from 'react';
import type { AuthenticatedUser, Project } from './types/engine-agent-api';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import ProjectDashboardPage from './pages/ProjectDashboard/ProjectDashboardPage';
import AppLayout from './components/Layout/AppLayout';
import AppHeader from './components/Header/AppHeader';
import { ENGINE_TYPE_LABELS } from './constants/engineTypes';
import './App.css';

type AuthView = 'login' | 'signup';

function App() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLogout = async () => {
    await window.engineAgentApi.auth.logout();
    setSelectedProject(null);
    setCurrentUser(null);
  };

  if (!currentUser) {
    return authView === 'login' ? (
      <LoginPage
        onLoginSuccess={setCurrentUser}
        onNavigateToSignup={() => setAuthView('signup')}
      />
    ) : (
      <SignupPage
        onSignupSuccess={setCurrentUser}
        onNavigateToLogin={() => setAuthView('login')}
      />
    );
  }

  if (!selectedProject) {
    return (
      <div className="app-shell">
        <AppHeader user={currentUser} onLogout={handleLogout} />
        <div className="app-shell__body">
          <ProjectDashboardPage onSelectProject={setSelectedProject} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppHeader
        user={currentUser}
        onLogout={handleLogout}
        onBack={() => setSelectedProject(null)}
        title={`${selectedProject.name}（${ENGINE_TYPE_LABELS[selectedProject.engineType]}）`}
      />
      <div className="app-shell__body">
        <AppLayout />
      </div>
    </div>
  );
}

export default App;
