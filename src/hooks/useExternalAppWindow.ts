import { useRef, useState } from 'react';
import { toDisplayErrorMessage } from '../utils/errorMessage';

/**
 * 外部アプリ（UE/Unity/Visual Studio Code等）を選択・起動し、
 * このフックを使うパネル要素の画面上の位置・サイズにウィンドウを合わせる。
 * 真のウィンドウ埋め込みではなく、macOSのシステムイベント経由の位置追従。
 */
export function useExternalAppWindow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [appPath, setAppPath] = useState<string | null>(null);
  const [processName, setProcessName] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPanelRect = () => {
    const element = containerRef.current;
    if (!element) {
      return null;
    }
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(window.screenX + rect.left),
      y: Math.round(window.screenY + rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  };

  const handleSelectApp = async () => {
    const selectedPath = await window.engineAgentApi.windowManager.selectApp();
    if (!selectedPath) {
      return;
    }
    setAppPath(selectedPath);
    const guessedName = selectedPath.split('/').pop()?.replace(/\.app$/, '') ?? '';
    setProcessName(guessedName);
  };

  const handleLaunchAndSync = async () => {
    if (!appPath || !processName.trim()) {
      return;
    }
    setErrorMessage(null);
    setIsLaunching(true);
    try {
      await window.engineAgentApi.windowManager.launch(appPath);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const rect = getPanelRect();
      if (rect) {
        await window.engineAgentApi.windowManager.syncPosition(processName.trim(), rect);
      }
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, 'アプリの起動または位置合わせに失敗しました。'));
    } finally {
      setIsLaunching(false);
    }
  };

  const handleResync = async () => {
    if (!processName.trim()) {
      return;
    }
    setErrorMessage(null);
    setIsSyncing(true);
    try {
      const rect = getPanelRect();
      if (rect) {
        await window.engineAgentApi.windowManager.syncPosition(processName.trim(), rect);
      }
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, '位置合わせに失敗しました。'));
    } finally {
      setIsSyncing(false);
    }
  };

  return {
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
  };
}
