# Engine-Agent-AI

UE（Unreal Engine）、Unity、Visual Studio / Visual Studio Codeなどの開発環境を直接起動し、
プロジェクトの解析・実装・ビルド検証・修正・改善を行うエージェントAIデスクトップアプリケーション。

作業ルールは [CLAUDE.md](./CLAUDE.md) を参照。

## 技術スタック

- Electron（デスクトップアプリ基盤）
- React + TypeScript + Vite（画面）
- Node.js + TypeScript（Electron Main Process側のロジック）
- SQLite（ローカル永続化。次フェーズで実装）
- Claude Agent SDK / Claude Code CLI（AIエージェント連携。次フェーズで実装）

## 現在の状態

現在は基盤整備フェーズ。以下は雛形（フォルダ構成・設定ファイル）のみで、
アカウント管理・DB・AIエージェント連携・ウィンドウ追従表示などの機能実装は未着手。

- 3パネル（チャット / エンジン / エディタ）のレイアウト骨組み
- Electronの起動エントリポイント
- 各機能層（`electron/db`, `electron/auth`, `electron/agent`, `electron/window-manager`）のディレクトリと責務定義

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
