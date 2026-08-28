import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ChatMessage } from '../../types/engine-agent-api';
import { toDisplayErrorMessage } from '../../utils/errorMessage';
import './ChatPanel.css';

interface ChatPanelProps {
  projectId: number;
}

/**
 * プロジェクトごとのチャット履歴を表示し、メッセージ送信を行うパネル。
 * 送信直後はエージェントの応答を待つ間、自分のメッセージを先行表示し
 * ローディング表示を出すことで、画面が固まって見えないようにしている。
 */
function ChatPanel({ projectId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [pendingUserContent, setPendingUserContent] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setPendingUserContent(null);
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
  }, [messages, pendingUserContent, isSending]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = inputValue.trim();
    if (!content) {
      return;
    }

    setErrorMessage(null);
    setPendingUserContent(content);
    setInputValue('');
    setIsSending(true);
    try {
      const newMessages = await window.engineAgentApi.chat.send(projectId, content);
      setMessages((current) => [...current, ...newMessages]);
    } catch (error) {
      setErrorMessage(toDisplayErrorMessage(error, 'メッセージの送信に失敗しました。'));
    } finally {
      setPendingUserContent(null);
      setIsSending(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel__messages">
        {messages.length === 0 && !pendingUserContent && (
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
        {pendingUserContent && (
          <div className="chat-panel__message chat-panel__message--user">
            <span className="chat-panel__message-role">あなた</span>
            <p>{pendingUserContent}</p>
          </div>
        )}
        {isSending && (
          <div className="chat-panel__message chat-panel__message--agent chat-panel__message--loading">
            <span className="chat-panel__message-role">エージェント</span>
            <p className="chat-panel__loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {errorMessage && <p className="chat-panel__error">{errorMessage}</p>}
      <form className="chat-panel__form" onSubmit={handleSubmit}>
        <textarea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="メッセージを入力..."
          rows={2}
          disabled={isSending}
        />
        <button type="submit" disabled={isSending || !inputValue.trim()}>
          {isSending ? '送信中...' : '送信'}
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
