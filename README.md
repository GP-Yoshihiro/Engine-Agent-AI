# Engine-Agent-AI

UE（Unreal Engine）、Unity、Visual Studio / Visual Studio Codeなどの開発環境を直接起動し、
プロジェクトの解析・実装・ビルド検証・修正・改善を行うエージェントAIデスクトップアプリケーション。

作業ルールは [CLAUDE.md](./CLAUDE.md) を参照。

## 技術スタック

- Electron（デスクトップアプリ基盤）
- React + TypeScript + Vite（画面）
- Node.js + TypeScript（Electron Main Process側のロジック）
- `node:sqlite`（ローカル永続化。ネイティブビルド依存を避けるためNode.js組み込みモジュールを使用）
- ローカルの `claude` CLI をサブプロセスとして呼び出すAIエージェント連携
  （Claude Pro/Maxのログインセッションを利用し、Anthropic APIの従量課金は発生しない）

## 現在の状態

- ログイン / 新規登録、アカウントごとのデータ分離
- プロジェクト管理（作成・一覧・削除、1アカウント最大20件、プロジェクトフォルダの選択）
- 3パネル（チャット / エンジン / エディタ）のレイアウト（サイズ変更・並び替え対応）
- チャット履歴の永続化とAIエージェント連携
  （プロジェクトフォルダに対してファイルの読み取り・編集に加え、
  npm/yarn/pnpmの実行やgitの基本操作など安全なビルド関連コマンドを許可。
  プロジェクト固有のビルドコマンドは `AGENT_EXTRA_BASH_RULES` で追加できる）
- 作業履歴の記録（AIエージェントが行ったファイル編集・コマンド実行等を記録し、
  ヘッダーの「作業履歴」ボタンから一覧表示できる）
- エンジン/IDEウィンドウの位置追従（macOSのみ。エンジン/エディタパネルで対象アプリ
  （.app）を選択・起動し、「位置を合わせる」ボタンでパネルの位置・サイズにウィンドウを
  合わせる。真の埋め込みではなく手動同期による疑似アタッチ。初回はmacOSの
  システム設定でアクセシビリティ権限の許可が必要）

## AIエージェントの利用要件

事前にローカル環境で [Claude Code](https://code.claude.com/) をインストールし、
`claude login` でClaude Pro/Maxアカウントにログインしておくこと。

```bash
claude login
```

`claude` コマンドがPATHに無い場合は、`.env` の `CLAUDE_CLI_PATH` にフルパスを設定する。

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
