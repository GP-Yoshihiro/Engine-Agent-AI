import type { AuthenticatedUser } from '../../types/engine-agent-api';
import './AppHeader.css';

interface AppHeaderProps {
  user: AuthenticatedUser;
  onLogout: () => void;
}

function AppHeader({ user, onLogout }: AppHeaderProps) {
  return (
    <header className="app-header">
      <span>ようこそ、{user.displayName} さん</span>
      <button type="button" onClick={onLogout}>
        ログアウト
      </button>
    </header>
  );
}

export default AppHeader;
