import { useState, type FormEvent } from 'react';
import type { AuthenticatedUser } from '../../types/engine-agent-api';
import { toDisplayErrorMessage } from '../../utils/errorMessage';
import '../../components/AuthForm/AuthForm.css';

interface SignupPageProps {
  onSignupSuccess: (user: AuthenticatedUser) => void;
  onNavigateToLogin: () => void;
}

function SignupPage({ onSignupSuccess, onNavigateToLogin }: SignupPageProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません。');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await window.engineAgentApi.auth.register(email, password, displayName);
      onSignupSuccess(user);
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, 'アカウント作成に失敗しました。'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h1>新規アカウント作成</h1>
      <form onSubmit={handleSubmit}>
        <label>
          表示名
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
        </label>
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          パスワード（8文字以上）
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        <label>
          パスワード（確認）
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>
        {errorMessage && <p className="auth-form__error">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '作成中...' : 'アカウント作成'}
        </button>
      </form>
      <button type="button" className="auth-form__link" onClick={onNavigateToLogin}>
        既にアカウントをお持ちの方はこちら
      </button>
    </div>
  );
}

export default SignupPage;
