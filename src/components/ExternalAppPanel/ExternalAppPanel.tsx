import { useExternalAppWindow } from '../../hooks/useExternalAppWindow';
import './ExternalAppPanel.css';

interface ExternalAppPanelProps {
  description: string;
}

/**
 * UE/Unity/Visual Studio Codeなど外部アプリを選択・起動し、
 * このパネルの位置・サイズにウィンドウを合わせる（手動同期）ためのUI。
 */
function ExternalAppPanel({ description }: ExternalAppPanelProps) {
  const {
    containerRef,
    appPath,
    processName,
    setProcessName,
    isLaunching,
    isSyncing,
    errorMessage,
    handleSelectApp,
    handleLaunchAndSync,
    handleResync,
  } = useExternalAppWindow();

  return (
    <div className="external-app-panel" ref={containerRef}>
      <p className="external-app-panel__description">{description}</p>
      <button type="button" onClick={handleSelectApp}>
        アプリを選択
      </button>
      {appPath && (
        <>
          <p className="external-app-panel__path">{appPath}</p>
          <label className="external-app-panel__process-name">
            プロセス名（System Eventsが認識する名前。違う場合は修正してください）
            <input
              type="text"
              value={processName}
              onChange={(event) => setProcessName(event.target.value)}
            />
          </label>
          <div className="external-app-panel__actions">
            <button type="button" onClick={handleLaunchAndSync} disabled={isLaunching}>
              {isLaunching ? '起動中...' : '起動して位置を合わせる'}
            </button>
            <button type="button" onClick={handleResync} disabled={isSyncing}>
              {isSyncing ? '同期中...' : '位置を再同期'}
            </button>
          </div>
        </>
      )}
      {errorMessage && <p className="external-app-panel__error">{errorMessage}</p>}
    </div>
  );
}

export default ExternalAppPanel;
