import ExternalAppPanel from '../ExternalAppPanel/ExternalAppPanel';

/**
 * Visual Studio / Visual Studio Code のソースコード編集画面を表示するパネル。
 * ウィンドウとしては独立させず、選択したIDEアプリのウィンドウ位置を
 * このパネルの位置・サイズに手動で合わせる（macOSのシステムイベント経由）。
 */
function EditorPanel() {
  return (
    <ExternalAppPanel description="Visual Studio / Visual Studio Code を選択して起動すると、このパネルの位置にウィンドウを合わせられます。" />
  );
}

export default EditorPanel;
