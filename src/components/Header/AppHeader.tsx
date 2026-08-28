import type { AuthenticatedUser } from '../../types/engine-agent-api';
import './AppHeader.css';

interface AppHeaderProps {
  user: AuthenticatedUser;
  onLogout: () => void;
  title?: string;
  onBack?: () => void;
  onShowWorkHistory?: () => void;
}

function AppHeader({ user, onLogout, title, onBack, onShowWorkHistory }: AppHeaderProps) {
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
      <div className="app-header__right">
        {onShowWorkHistory && (
          <button type="button" onClick={onShowWorkHistory}>
            作業履歴
          </button>
        )}
        <button type="button" onClick={onLogout}>
          ログアウト
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
