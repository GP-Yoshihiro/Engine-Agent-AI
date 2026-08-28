import { spawn } from 'node:child_process';

export class AgentError extends Error {}

export interface AgentRunResult {
  responseText: string;
}

export interface AgentRunParams {
  prompt: string;
  projectPath: string;
  projectName: string;
  engineType: string;
}

interface ClaudeCliResult {
  result?: unknown;
  is_error?: boolean;
}

const CLAUDE_CLI_COMMAND = process.env.CLAUDE_CLI_PATH || 'claude';

/**
 * ユーザーがローカルで `claude login` 済みのClaude Code CLIをサブプロセスとして呼び出す。
 * Claude Pro/Maxプランのログインセッションをそのまま使うため、
 * Anthropic Console のAPIキー課金を発生させない。
 *
 * headlessモードのCLIには操作ごとの承認コールバック（canUseTool）が無いため、
 * 安全側に倒し、読み取り・ファイル編集のみを許可しBashコマンド実行は許可しない。
 */
export class AgentService {
  run(params: AgentRunParams): Promise<AgentRunResult> {
    const systemPromptAppend = `あなたは開発プロジェクト「${params.projectName}」（使用エンジン: ${params.engineType}）の解析・実装を支援するAIエージェントです。`;

    return new Promise((resolve, reject) => {
      const child = spawn(
        CLAUDE_CLI_COMMAND,
        [
          '-p',
          params.prompt,
          '--output-format',
          'json',
          '--permission-mode',
          'acceptEdits',
          '--allowedTools',
          'Read,Glob,Grep,Edit,Write',
          '--append-system-prompt',
          systemPromptAppend,
        ],
        { cwd: params.projectPath },
      );

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          reject(
            new AgentError(
              'claude CLIが見つかりません。事前に claude CLI をインストールし、claude login でログインしてください。',
            ),
          );
        } else {
          reject(new AgentError(`AIエージェントの起動に失敗しました: ${error.message}`));
        }
      });

      child.on('close', (exitCode: number | null) => {
        try {
          const parsed = JSON.parse(stdout) as ClaudeCliResult;
          if (typeof parsed.result === 'string' && parsed.result.length > 0) {
            const responseText = parsed.is_error
              ? `AIエージェントでエラーが発生しました: ${parsed.result}`
              : parsed.result;
            resolve({ responseText });
            return;
          }
        } catch {
          // JSONとして解釈できなかった場合は下のエラー処理に進む
        }

        reject(
          new AgentError(
            `AIエージェントの処理に失敗しました（終了コード: ${exitCode}）。${stderr.trim()}`,
          ),
        );
      });
    });
  }
}
