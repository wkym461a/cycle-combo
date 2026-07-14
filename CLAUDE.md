# CLAUDE.md (cycle-combo)

このファイルは `cycle-combo` リポジトリで作業する際の前提知識をまとめたもの。
グローバル設定（`~/.claude/CLAUDE.md`）のライフログ保存ルールは、このプロジェクトでも通常どおり適用される（`~/life` 以外のプロジェクトなので、pathspec限定コミット・push禁止の節を厳守する）。

作業ディレクトリ名は歴史的経緯で `cycle-combo-dev` のままだが、`origin` は `cycle-combo`（統合後の単一リポジトリ）を指す。旧 `cycle-combo-dev` リポジトリはArchive済みで、以後の開発はこのリポジトリ1本で行う。

## アプリ概要

**Cycle Combo（バドミントン部タイマ）** — バドミントン部のダブルス練習向けインターバルタイマ兼ペア組み合わせローテーション表示アプリ。GitHub Pagesでホストし、Mac/Xcode不要でiOS端末（家族のスマホ等、VPN接続していない端末を含む）からPWAとして使えることを狙った構成。

- 人数（4〜10人）とタイマー時間（1〜10分）を選択して開始すると、あらかじめ用意された「総当たり的にペアが重複しにくい組み合わせ表」（`src/contexts/matches/consts.tsx` の `matchList4`〜`matchList10`）に沿って試合組を順に表示する。
- タイマーが0になると自動で次の試合組に進み、通知音を再生する（`src/assets/timer.mp3` を Web Audio API で再生）。
- PWA対応（`vite-plugin-pwa`）。iOS Safari 特有の音声再生制約（ユーザー操作なしでは `AudioContext` が鳴らない）への対応として、「音声テスト」ボタンで明示的に `resume()` させる導線がある。
- 画面回転（縦/横）で試合組一覧ドロワーの表示状態を自動切替する。

## 技術スタック

- React 18 + TypeScript + Vite（`@vitejs/plugin-react-swc`）
- MUI (`@mui/material`, `@mui/icons-material`) + Emotion
- 状態管理は Context + `useReducer` の自前実装（Redux等は未使用）。`timer` / `matches` / `audio` の3つの Context が `src/contexts/` にあり、`src/App/index.tsx` でネストして提供している。
- パスエイリアス `~/*` → `src/*`（`vite-tsconfig-paths` + `tsconfig.app.json`）

## ディレクトリ構成

```
src/
  App/index.tsx          # Provider類のネストとテーマ設定（ダークモード自動追従）
  contexts/
    timer/                # カウントダウンタイマーの状態（setTimeout駆動）
    matches/               # 人数に応じた試合組リストと現在の組インデックス
    matches/consts.tsx     # 4〜10人分の総当たり的組み合わせ表（ハードコード）
    audio/                  # AudioContext/AudioBufferによるタイマー音再生
  pages/Home/
    index.tsx               # トップ画面（タイマー分・人数選択、開始ボタン、音声テスト）
    MatchTimerDialog.tsx     # フルスクリーンのタイマー実行画面
    components/
      MatchTimer.tsx          # タイマー表示・開始/一時停止/リセット、レスポンシブスケーリング
      MatchListDrawer.tsx      # 試合組一覧ドロワー
      MatchItem.tsx             # 1試合組（ペア×2）の表示
  components/ConfirmModal.tsx  # 汎用確認モーダル
```

## コマンド

- `npm run dev` — 開発サーバー
- `npm run build` — `tsc -b && vite build`（`DEPLOY_BASE_PATH` 環境変数で `base` を上書き可能。未指定時は本番と同じ `/cycle-combo/`）
- `npm run lint` — ESLint
- `npm run preview` — ビルド結果のプレビュー

## デプロイ運用（単一リポジトリ + gh-pagesブランチのサブディレクトリ配信）

旧: `cycle-combo-dev`（開発・Actionsベースの自動Pages）と `cycle-combo`（本番・手作業でファイルをコピーして反映）の2リポジトリ運用だったが、手作業コピーの同期漏れリスクを解消するため単一リポジトリに統合した。統合の経緯・判断根拠は過去の会話ログ参照（このMdには結論のみ記す）。

- `main` への push → `DEPLOY_BASE_PATH=/cycle-combo/dev/` でビルドし、`gh-pages` ブランチの `dev/` サブディレクトリに配信（`peaceiris/actions-gh-pages@v4`, `destination_dir: dev`, `keep_files: true`）。
  - 開発確認用URL: https://wkym461a.github.io/cycle-combo/dev/
- `vX.Y.Z` タグの push → `DEPLOY_BASE_PATH=/cycle-combo/` でビルドし、`gh-pages` ブランチのルートに配信（`keep_files: true` で `dev/` を消さない）。
  - **本番URL（家族が使う側）**: https://wkym461a.github.io/cycle-combo/
- ワークフロー定義: `.github/workflows/deploy-gh-pages.yml`（`deploy-dev` / `deploy-prod` の2ジョブ、`if` で `main` push / `v*` タグ push を振り分け）。
- GitHub側の前提設定: リポジトリ Settings → Pages の Source は「Deploy from a branch: `gh-pages` / `/(root)`」（Actionsベースのデプロイ方式ではない）。Settings → Actions → General → Workflow permissions は「Read and write permissions」（`gh-pages` ブランチへのpushに必要）。

## バージョニング／リリース運用

- タグは `vX.Y.Z`（semver）に統一。**このタグをpushすることが本番反映のトリガー**なので、リリースしたい時だけタグを打つ運用（旧`cycle-combo-dev`時代の `rNN` リビジョンタグ運用は退役。過去の `r01`〜`r13` タグは履歴として残っているだけで新規には増やさない）。
- 画面下部の表示は `ver.{VITE_VERSION}`（`package.json` の `version` を参照、`src/pages/Home/index.tsx`）。旧 `(rNN)` 表示は削除済み。
- コミットメッセージの接頭辞規約: `[Add]` 新機能、`[Update]` 既存機能の更新・バージョン反映、`[Fix]` バグ修正。機能ブランチ（`feature/*`, `fix/*`）を作って `main` にマージするフローで、マージコミットも履歴に残す。
- バージョンを上げる際は `[Update] vX.Y.Z反映` という単独コミット（`package.json`/`package-lock.json` の `version` のみ変更）を作り、その後 `vX.Y.Z` タグをpushして本番反映する。

## 未対応のIssue（確認時点、要再確認）

`cycle-combo-dev` 側にあった以下のIssueは、統合時点でこのリポジトリに引き継がれていない可能性がある（Issueはリポジトリに紐づくため）。着手前にGitHub上の実際のIssue一覧を確認すること。

- タイマ音の種類を増やしたい
- 画面が勝手にスリープしないようにしてほしい
- 音量の上限を上げてほしい
- タイマーが終わりそうなことを知らせてほしい
