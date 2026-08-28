/**
 * UE / Unity エンジン画面を表示するパネル。
 * 実際のエンジンウィンドウ追従表示は electron/window-manager 実装後に接続する。
 */
function EnginePanel() {
  return (
    <div>
      <h2>エンジン画面</h2>
      <p>UE / Unity のエディタウィンドウがここに表示されます。</p>
    </div>
  );
}

export default EnginePanel;
