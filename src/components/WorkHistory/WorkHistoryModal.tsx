import { useEffect, useState } from 'react';
import type { WorkHistoryEntry } from '../../types/engine-agent-api';
import './WorkHistoryModal.css';

interface WorkHistoryModalProps {
  projectId: number;
  onClose: () => void;
}

/** AIエージェントがこれまでにプロジェクトへ行った操作（ファイル編集・コマンド実行等）の履歴を表示する。 */
function WorkHistoryModal({ projectId, onClose }: WorkHistoryModalProps) {
  const [entries, setEntries] = useState<WorkHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    window.engineAgentApi.workHistory.list(projectId).then((list) => {
      if (!cancelled) {
        setEntries(list);
        setIsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return (
    <div className="work-history-overlay" onClick={onClose}>
      <div className="work-history-modal" onClick={(event) => event.stopPropagation()}>
        <div className="work-history-modal__header">
          <h2>作業履歴</h2>
          <button type="button" onClick={onClose}>
            閉じる
          </button>
        </div>
        {isLoading && <p>読み込み中...</p>}
        {!isLoading && entries.length === 0 && <p>まだ操作履歴はありません。</p>}
        <ul className="work-history-list">
          {entries.map((entry) => (
            <li key={entry.id} className="work-history-list__item">
              <span className="work-history-list__tool">{entry.toolName}</span>
              <span className="work-history-list__summary">{entry.summary}</span>
              <span className="work-history-list__time">{entry.createdAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default WorkHistoryModal;
