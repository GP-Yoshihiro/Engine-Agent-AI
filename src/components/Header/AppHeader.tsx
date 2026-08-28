import type { AuthenticatedUser } from '../../types/engine-agent-api';
import './AppHeader.css';

interface AppHeaderProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  title?: string;
  onBack?: () => void;
}

function AppHeader({ user, onLogout, title, onBack }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        {onBack && (
          <button type="button" onClick={onBack}>
            プロジェクト一覧へ戻る
          </button>
        )}
        <span>ようこそ、{user.displayName} さん</span>
        {title && <span className="app-header__title">{title}</span>}
      </div>
      <button type="button" onClick={onLogout}>
        ログアウト
      </button>
    </header>
  );
}

export default AppHeader;
