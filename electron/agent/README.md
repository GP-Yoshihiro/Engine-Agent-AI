# agent/

AIエージェント連携層。

## 責務（次フェーズで実装）

- Claude Agent SDK / Claude Code CLI の呼び出し
- プロジェクト解析・改善提案・コード修正・ビルド検証タスクの実行制御
- 実行結果の作業履歴（work_history）への記録
- `ANTHROPIC_API_KEY` は `.env` から読み込み、Rendererには一切渡さない
