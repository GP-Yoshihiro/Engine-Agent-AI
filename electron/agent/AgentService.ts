import { query } from '@anthropic-ai/claude-agent-sdk';

export class AgentError extends Error {}

export interface AgentRunResult {
  responseText: string;
}

export type ToolApprovalRequester = (
  toolName: string,
  input: Record<string, unknown>,
  description?: string,
) => Promise<boolean>;

export interface AgentRunParams {
  prompt: string;
  projectPath: string;
  projectName: string;
  engineType: string;
  requestToolApproval: ToolApprovalRequester;
}

/** 読み取り系は自動許可、編集・実行系はユーザー承認を必須にするツール構成。 */
const ALLOWED_TOOL_NAMES = ['Read', 'Glob', 'Grep', 'Write', 'Edit', 'Bash'];
const AUTO_APPROVED_TOOL_NAMES = ['Read', 'Glob', 'Grep'];

/**
 * Claude Agent SDK を用いてプロジェクトの解析・編集・ビルド検証タスクを実行するサービス。
 * ファイル編集・コマンド実行はcanUseTool経由で必ずユーザーの承認を求める。
 */
export class AgentService {
  async run(params: AgentRunParams): Promise<AgentRunResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new AgentError(
        'ANTHROPIC_API_KEYが設定されていません。.envファイルにAPIキーを設定してからアプリを再起動してください。',
      );
    }

    const agentModel = process.env.AGENT_MODEL;

    for await (const message of query({
      prompt: params.prompt,
      options: {
        cwd: params.projectPath,
        tools: ALLOWED_TOOL_NAMES,
        allowedTools: AUTO_APPROVED_TOOL_NAMES,
        permissionMode: 'default',
        ...(agentModel ? { model: agentModel } : {}),
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `あなたは開発プロジェクト「${params.projectName}」（使用エンジン: ${params.engineType}）の解析・実装・ビルド検証を支援するAIエージェントです。`,
        },
        canUseTool: async (toolName, input, options) => {
          const approved = await params.requestToolApproval(toolName, input, options.title);
          return approved
            ? { behavior: 'allow', updatedInput: input }
            : { behavior: 'deny', message: 'ユーザーがこの操作を許可しませんでした。' };
        },
      },
    })) {
      if (message.type === 'result') {
        if (message.subtype === 'success') {
          return { responseText: message.result };
        }
        throw new AgentError(
          `AIエージェントの処理が完了しませんでした（${message.subtype}）。もう一度お試しください。`,
        );
      }
    }

    throw new AgentError('AIエージェントから応答を取得できませんでした。');
  }
}
