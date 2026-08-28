import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ChatMessage } from '../../types/engine-agent-api';
import { toDisplayErrorMessage } from '../../utils/errorMessage';
import './ChatPanel.css';

interface ChatPanelProps {
  projectId: number;
}

/**
 * プロジェクトごとのチャット履歴を表示し、メッセージ送信を行うパネル。
 * AIエージェント連携が実装されるまでは、送信すると固定の案内メッセージが返る。
 */
function ChatPanel({ projectId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    window.engineAgentApi.chat.list(projectId).then((loadedMessages) => {
      if (!cancelled) {
        setMessages(loadedMessages);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = inputValue.trim();
    if (!content) {
      return;
    }

    setErrorMessage(null);
    setIsSending(true);
    try {
      const newMessages = await window.engineAgentApi.chat.send(projectId, content);
      setMessages((current) => [...current, ...newMessages]);
      setInputValue('');
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, 'メッセージの送信に失敗しました。'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel__messages">
        {messages.length === 0 && (
          <p className="chat-panel__empty">エージェントとの対話はここに表示されます。</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`chat-panel__message chat-panel__message--${message.role}`}>
            <span className="chat-panel__message-role">
              {message.role === 'user' ? 'あなた' : 'エージェント'}
            </span>
            <p>{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {errorMessage && <p className="chat-panel__error">{errorMessage}</p>}
      <form className="chat-panel__form" onSubmit={handleSubmit}>
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="メッセージを入力..."
          rows={2}
        />
        <button type="submit" disabled={isSending || !inputValue.trim()}>
          送信
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
