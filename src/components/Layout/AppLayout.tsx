import { Fragment, useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import ChatPanel from '../ChatPanel/ChatPanel';
import EnginePanel from '../EnginePanel/EnginePanel';
import EditorPanel from '../EditorPanel/EditorPanel';
import { PANEL_LABELS, type PanelId } from './panelTypes';
import './AppLayout.css';

const DEFAULT_ORDER: PanelId[] = ['chat', 'engine', 'editor'];
const DEFAULT_WIDTHS: Record<PanelId, number> = {
  chat: 320,
  engine: 640,
  editor: 640,
};
const MIN_PANEL_WIDTH = 220;

function renderPanelContent(panelId: PanelId, projectId: number): JSX.Element {
  switch (panelId) {
    case 'chat':
      return <ChatPanel projectId={projectId} />;
    case 'engine':
      return <EnginePanel />;
    case 'editor':
      return <EditorPanel />;
  }
}

interface DragState {
  leftPanel: PanelId;
  /** nullの場合、右側は残り幅を自動で埋める最後のパネルなので左側のみ幅を変更する。 */
  rightPanel: PanelId | null;
  startX: number;
  startLeftWidth: number;
  startRightWidth: number;
}

/**
 * 3パネル（チャット/エンジン/エディタ）のレイアウト。
 * 各パネルはドラッグでサイズ変更、◀▶ボタンで並び替えができる（ウィンドウとしては独立させない）。
 */
interface AppLayoutProps {
  projectId: number;
}

function AppLayout({ projectId }: AppLayoutProps) {
  const [order, setOrder] = useState<PanelId[]>(DEFAULT_ORDER);
  const [widths, setWidths] = useState<Record<PanelId, number>>(DEFAULT_WIDTHS);
  const dragState = useRef<DragState | null>(null);

  const movePanel = (panelId: PanelId, direction: -1 | 1) => {
    setOrder((current) => {
      const index = current.indexOf(panelId);
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const drag = dragState.current;
    if (!drag) return;
    const delta = event.clientX - drag.startX;

    if (drag.rightPanel === null) {
      const newLeftWidth = Math.max(MIN_PANEL_WIDTH, drag.startLeftWidth + delta);
      setWidths((current) => ({ ...current, [drag.leftPanel]: newLeftWidth }));
      return;
    }

    const newLeftWidth = drag.startLeftWidth + delta;
    const newRightWidth = drag.startRightWidth - delta;
    if (newLeftWidth >= MIN_PANEL_WIDTH && newRightWidth >= MIN_PANEL_WIDTH) {
      const rightPanel = drag.rightPanel;
      setWidths((current) => ({
        ...current,
        [drag.leftPanel]: newLeftWidth,
        [rightPanel]: newRightWidth,
      }));
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const handleDividerMouseDown =
    (leftPanel: PanelId, rightPanel: PanelId | null) => (event: ReactMouseEvent) => {
      dragState.current = {
        leftPanel,
        rightPanel,
        startX: event.clientX,
        startLeftWidth: widths[leftPanel],
        startRightWidth: rightPanel ? widths[rightPanel] : 0,
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    };

  return (
    <div className="app-layout">
      {order.map((panelId, index) => {
        const isLast = index === order.length - 1;
        const nextPanelId = isLast ? null : order[index + 1];
        const nextIsLast = nextPanelId !== null && index + 1 === order.length - 1;

        return (
          <Fragment key={panelId}>
            <section
              className="app-layout__panel"
              style={isLast ? { flex: '1 1 auto' } : { flex: `0 0 ${widths[panelId]}px` }}
            >
              <div className="app-layout__panel-header">
                <span>{PANEL_LABELS[panelId]}</span>
                <div className="app-layout__panel-controls">
                  <button
                    type="button"
                    onClick={() => movePanel(panelId, -1)}
                    disabled={index === 0}
                    aria-label="左へ移動"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => movePanel(panelId, 1)}
                    disabled={isLast}
                    aria-label="右へ移動"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <div className="app-layout__panel-body">
                {renderPanelContent(panelId, projectId)}
              </div>
            </section>
            {!isLast && (
              <div
                className="app-layout__divider"
                onMouseDown={handleDividerMouseDown(panelId, nextIsLast ? null : nextPanelId)}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export default AppLayout;
