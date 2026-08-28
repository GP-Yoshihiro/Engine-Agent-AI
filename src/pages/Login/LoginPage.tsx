import { useState, type FormEvent } from 'react';
import type { AuthenticatedUser } from '../../types/engine-agent-api';
import '../../components/AuthForm/AuthForm.css';

interface LoginPageProps {
  onLoginSuccess: (user: AuthenticatedUser) => void;
  onNavigateToSignup: () => void;
}

function LoginPage({ onLoginSuccess, onNavigateToSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const user = await window.engineAgentApi.auth.login(email, password);
      onLoginSuccess(user);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'ログインに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
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
          パスワード
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {errorMessage && <p className="auth-form__error">{errorMessage}</p>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      <button type="button" className="auth-form__link" onClick={onNavigateToSignup}>
        アカウントをお持ちでない方はこちら
      </button>
    </div>
  );
}

export default LoginPage;
