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

const BASE_ALLOWED_TOOLS = ['Read', 'Glob', 'Grep', 'Edit', 'Write'];

/**
 * headlessモードには操作ごとの承認コールバックが無いため、Bashは無制限には許可せず、
 * ビルド・テスト・バージョン管理でよく使う安全なコマンドの接頭辞のみを許可する。
 * プロジェクト固有のビルドコマンド（UEのRunUAT、Unityのバッチビルド等）を追加したい場合は
 * 環境変数 AGENT_EXTRA_BASH_RULES に "Bash(コマンド接頭辞 *)" 形式でカンマ区切り指定する。
 */
const DEFAULT_BASH_RULES = [
  'Bash(npm run *)',
  'Bash(npm test)',
  'Bash(npm install)',
  'Bash(npm ci)',
  'Bash(yarn *)',
  'Bash(pnpm *)',
  'Bash(git status)',
  'Bash(git status *)',
  'Bash(git diff *)',
  'Bash(git log *)',
  'Bash(git add *)',
  'Bash(git commit *)',
];

function buildAllowedToolsFlag(): string {
  const extraRules = (process.env.AGENT_EXTRA_BASH_RULES ?? '')
    .split(',')
    .map((rule) => rule.trim())
    .filter((rule) => rule.length > 0);
  return [...BASE_ALLOWED_TOOLS, ...DEFAULT_BASH_RULES, ...extraRules].join(',');
}

/**
 * ユーザーがローカルで `claude login` 済みのClaude Code CLIをサブプロセスとして呼び出す。
 * Claude Pro/Maxプランのログインセッションをそのまま使うため、
 * Anthropic Console のAPIキー課金を発生させない。
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
          buildAllowedToolsFlag(),
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
