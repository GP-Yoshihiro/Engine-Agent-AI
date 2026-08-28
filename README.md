# Engine-Agent-AI

UE（Unreal Engine）、Unity、Visual Studio / Visual Studio Codeなどの開発環境を直接起動し、
プロジェクトの解析・実装・ビルド検証・修正・改善を行うエージェントAIデスクトップアプリケーション。

作業ルールは [CLAUDE.md](./CLAUDE.md) を参照。

## 技術スタック

- Electron（デスクトップアプリ基盤）
- React + TypeScript + Vite（画面）
- Node.js + TypeScript（Electron Main Process側のロジック）
- `node:sqlite`（ローカル永続化。ネイティブビルド依存を避けるためNode.js組み込みモジュールを使用）
- Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）によるAIエージェント連携

## 現在の状態

- ログイン / 新規登録、アカウントごとのデータ分離
- プロジェクト管理（作成・一覧・削除、1アカウント最大20件、プロジェクトフォルダの選択）
- 3パネル（チャット / エンジン / エディタ）のレイアウト（サイズ変更・並び替え対応）
- チャット履歴の永続化とAIエージェント連携
  （プロジェクトフォルダに対してファイル読み書き・Bash実行が可能。書き込み系操作は
  実行前に必ずGUI上で許可を求める）
- 未実装: エンジン/IDEウィンドウの追従配置（`electron/window-manager`）、作業履歴（実行ログ）の記録

## セットアップ

このリポジトリを操作する開発環境にNode.js（LTS版推奨）が必要。未導入の場合は以下のいずれかで導入する。

```bash
brew install node
```

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install --lts
```

依存関係のインストール:

```bash
npm install
```

開発サーバー起動（Reactのみブラウザで確認する場合）:

```bash
npm run dev
```

Electronアプリとして起動:

```bash
npm run electron:dev
```

## 環境変数

`.env.example` をコピーして `.env` を作成し、必要な値を設定する（`.env` はコミットしないこと）。

```bash
cp .env.example .env
```
