# db/

SQLiteアクセス層。

## 責務（次フェーズで実装）

- アカウント管理DB（users）
- プロジェクト管理（projects、上限20件のアカウント単位バリデーションを含む）
- 会話履歴・作業履歴（chat_messages、work_history）
- レイアウト設定の永続化（layout_settings）

DBファイルはユーザーごとの `app.getPath('userData')` 配下に保存し、アプリ配布物には含めない。
