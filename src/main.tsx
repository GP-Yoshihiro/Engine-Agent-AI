import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root') as HTMLElement;

if (
  !window.engineAgentApi?.auth ||
  !window.engineAgentApi?.projects ||
  !window.engineAgentApi?.chat ||
  !window.engineAgentApi?.workHistory
) {
  ReactDOM.createRoot(rootElement).render(
    <div style={{ padding: 32 }}>
      <h1>アプリの初期化に失敗しました</h1>
      <p>
        アプリ内部の連携処理を読み込めませんでした。お手数ですがアプリを完全に終了し、
        起動し直してください。
      </p>
    </div>,
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
