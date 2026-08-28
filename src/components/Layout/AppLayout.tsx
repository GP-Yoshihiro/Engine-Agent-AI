import ChatPanel from '../ChatPanel/ChatPanel';
import EnginePanel from '../EnginePanel/EnginePanel';
import EditorPanel from '../EditorPanel/EditorPanel';
import './AppLayout.css';

/**
 * 画面構成の3軸（チャット / エンジン / エディタ）を並べる基本レイアウト。
 * パネルのサイズ・配置をユーザーが変更できる編集機能は次フェーズで実装する。
 */
function AppLayout() {
  return (
    <div className="app-layout">
      <section className="app-layout__panel app-layout__panel--chat">
        <ChatPanel />
      </section>
      <section className="app-layout__panel app-layout__panel--engine">
        <EnginePanel />
      </section>
      <section className="app-layout__panel app-layout__panel--editor">
        <EditorPanel />
      </section>
    </div>
  );
}

export default AppLayout;
