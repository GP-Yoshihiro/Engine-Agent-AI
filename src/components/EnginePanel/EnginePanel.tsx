import ExternalAppPanel from '../ExternalAppPanel/ExternalAppPanel';

/**
 * UE / Unity エンジン画面を表示するパネル。
 * ウィンドウとしては独立させず、選択したエンジンアプリのウィンドウ位置を
 * このパネルの位置・サイズに手動で合わせる（macOSのシステムイベント経由）。
 */
function EnginePanel() {
  return (
    <ExternalAppPanel description="UE / Unity のエディタアプリを選択して起動すると、このパネルの位置にウィンドウを合わせられます。" />
  );
}

export default EnginePanel;
