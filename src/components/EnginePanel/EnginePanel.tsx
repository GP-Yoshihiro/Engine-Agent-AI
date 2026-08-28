/**
 * UE / Unity エンジン画面を表示するパネル。
 * 実際のエンジンウィンドウ追従表示は electron/window-manager 実装後に接続する。
 */
function EnginePanel() {
  return (
    <div>
      <p>UE / Unity のエディタウィンドウがここに表示されます。</p>
    </div>
  );
}

export default EnginePanel;
