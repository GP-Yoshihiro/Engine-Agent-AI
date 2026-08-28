import { useState } from 'react';
import type { AuthenticatedUser } from './types/engine-agent-api';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import AppLayout from './components/Layout/AppLayout';
import AppHeader from './components/Header/AppHeader';
import './App.css';

type AuthView = 'login' | 'signup';

function App() {
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');

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

  return (
    <div className="app-shell">
      <AppHeader user={currentUser} onLogout={() => setCurrentUser(null)} />
      <div className="app-shell__body">
        <AppLayout />
      </div>
    </div>
  );
}

export default App;
