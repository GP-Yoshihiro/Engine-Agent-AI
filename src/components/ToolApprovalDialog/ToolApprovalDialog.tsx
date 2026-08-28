import { useEffect, useState } from 'react';
import type { ToolApprovalRequest } from '../../types/engine-agent-api';
import './ToolApprovalDialog.css';

function describeToolInput(input: Record<string, unknown>): string {
  if (typeof input.command === 'string') {
    return `コマンド: ${input.command}`;
  }
  if (typeof input.file_path === 'string') {
    return `ファイル: ${input.file_path}`;
  }
  return JSON.stringify(input, null, 2);
}

/**
 * AIエージェントがファイル編集・コマンド実行など承認が必要な操作を行う際に、
 * ユーザーへ許可/拒否を求めるダイアログ。ログイン後は常時マウントしておき、
 * Main側からの承認要求（agent:approval-request）を待ち受ける。
 */
function ToolApprovalDialog() {
  const [queue, setQueue] = useState<ToolApprovalRequest[]>([]);

  useEffect(() => {
    const unsubscribe = window.engineAgentApi.agent.onApprovalRequest((request) => {
      setQueue((current) => [...current, request]);
    });
    return unsubscribe;
  }, []);

  const current = queue[0];
  if (!current) {
    return null;
  }

  const respond = async (approved: boolean) => {
    await window.engineAgentApi.agent.respondApproval(current.requestId, approved);
    setQueue((rest) => rest.slice(1));
  };

  return (
    <div className="tool-approval-overlay">
      <div className="tool-approval-dialog">
        <h2>AIエージェントが操作の許可を求めています</h2>
        <p className="tool-approval-dialog__tool-name">
          {current.description ?? current.toolName}
        </p>
        <pre className="tool-approval-dialog__detail">{describeToolInput(current.input)}</pre>
        <div className="tool-approval-dialog__actions">
          <button type="button" onClick={() => respond(false)}>
            拒否
          </button>
          <button type="button" onClick={() => respond(true)}>
            許可
          </button>
        </div>
      </div>
    </div>
  );
}

export default ToolApprovalDialog;
