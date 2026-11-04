# CLAUDE.md (cycle-combo)

このファイルは `cycle-combo` リポジトリで作業する際の前提知識をまとめたもの。
グローバル設定（`~/.claude/CLAUDE.md`）のライフログ保存ルールは、このプロジェクトでも通常どおり適用される（`~/life` 以外のプロジェクトなので、pathspec限定コミット・push禁止の節を厳守する）。

作業ディレクトリ名は `cycle-combo`（`origin` が指す統合後の単一リポジトリ名と一致）。旧 `cycle-combo-dev` リポジトリはArchive済みで、以後の開発はこのリポジトリ1本で行う。

## アプリ概要

**Cycle Combo（バドミントン部タイマ）** — バドミントン部のダブルス練習向けインターバルタイマ兼ペア組み合わせローテーション表示アプリ。GitHub Pagesでホストし、Mac/Xcode不要でiOS端末（家族のスマホ等、VPN接続していない端末を含む）からPWAとして使えることを狙った構成。

- 人数（4〜10人）とタイマー時間（1〜10分）を選択して開始すると、あらかじめ用意された「総当たり的にペアが重複しにくい組み合わせ表」（`src/contexts/matches/consts.tsx` の `matchList4`〜`matchList10`）に沿って試合組を順に表示する。
- タイマーが0になると自動で次の試合組に進み、通知音（チャイム/ビープ/ベルから選択、音量ブースト可）を再生する。
- PWA対応（`vite-plugin-pwa`）。新バージョンは自動リロードせず、ホーム画面にSnackbarを出してユーザー操作で更新する（`registerType: 'prompt'`、`src/components/UpdatePrompt.tsx`）。タイマー実行中は通知を出さない。
- 画面回転（縦/横）で試合組一覧ドロワーの表示状態を自動切替する（`matchMedia('(orientation: landscape)')`）。
- 設定（分・人数・音・音量）とタイマー実行中の状態（終了予定時刻・周回数・現在の試合組）は `localStorage`（キー接頭辞 `cycle-combo:`、`src/lib/storage.ts`）に保存し、リロード後も復元する。実行中にリロードした場合はタイマー画面に直接戻る。

### タイマーの設計（`src/contexts/timer/reducer.ts`）

- 「残り秒数を1秒ごとに減らす」のではなく、終了予定時刻 `endAt`（epoch ms）を状態に持ち、`tick` で現在時刻との差分から残り時間を求める。`tick` は 250ms 間隔に加え、`visibilitychange` / `pageshow` / `focus` でも発火する。
- 終了時刻を過ぎると自動で次の周に入り `laps` が増える。バックグラウンドで複数周ぶん時間が経っていればまとめて進む。`MatchTimerDialog` が `laps` の増分を見て試合組を進め、音を1回鳴らす。
- reducer は純粋関数（時刻は action で受け取る）。`esbuild` でトランスパイルすれば node 単体で動かせる。

### 音声の設計（`src/contexts/audio/engine.ts`）

- 実際の音は Web Audio（AudioBuffer → GainNode → DynamicsCompressor）で鳴らす。GainNode で100%超のブーストを行う（`<audio>` の `volume` は iOS で無視されるため）。
- iOS の消音スイッチ対策: HTMLMediaElement が再生中だとオーディオセッションが「再生」扱いになり Web Audio も消音スイッチを無視して鳴る性質を使い、ほぼ無音の `keep-alive.wav` を `<audio>` でループ再生し続ける（unmute.js と同じ手法）。タイマー開始（ユーザー操作）で `activateSession()`、終了で `deactivateSession()`。副作用として、再生中は端末の音楽アプリの再生が止まる。副次的に iOS がページをバックグラウンドでも動かし続けやすくなる。
- 着信・Siri・他アプリ音声・バックグラウンド移行で `AudioContext` が止まるため、`statechange` と `visibilitychange` で `resume()` を試み、それでも鳴らせない状態（`isUnlocked === false`）ならタイマー画面に「有効化」バナーを出してユーザー操作で復帰させる（リロード直後もこの経路）。
- 音源は `src/assets/sound-*.mp3`（mono 96kbps）。旧 `timer.mp3` は `sound-chime.mp3` に改名。
- **実機未検証**: 上記の消音スイッチ対策はこの環境（Linux、ブラウザなし）では確認できていない。iPhone で「マナーモードで鳴るか」「画面ロック中に鳴るか」を確認すること。

### 状態管理の規約

- 各 Context は「状態」と「操作」を別の Context に分け、`useXxxState()` / `useXxxActions()` で取り出す。操作側は `dispatch` にしか依存しないので参照が安定し、毎秒の `tick` で再描画されるのはタイマー表示（`MatchTimer`）だけになる。
- reducer に副作用を入れない。ブラウザAPI（AudioContext、`<audio>`、NoSleep）は Provider の `useRef`/`useEffect` で生成・破棄し、モジュール評価時には何もしない。
- 確認ダイアログは `useConfirm()`（`src/hooks/useConfirm.tsx`）で `await confirm({...})` の形で使う。

## 技術スタック

- React 18 + TypeScript + Vite（`@vitejs/plugin-react-swc`）
- MUI (`@mui/material`, `@mui/icons-material`) + Emotion
- 状態管理は Context + `useReducer`/`useState` の自前実装（Redux等は未使用）。`timer` / `matches` / `audio` / `wakeLock` の Provider が `src/contexts/` にあり、`src/App/index.tsx` でネストして提供している（各 Provider は状態用と操作用の2つの Context を持つ。「状態管理の規約」参照）。
- パスエイリアス `~/*` → `src/*`（`vite-tsconfig-paths` + `tsconfig.app.json`）

## ディレクトリ構成

```
src/
  App/index.tsx          # Provider類のネストとテーマ設定（ダークモード自動追従）
  contexts/
    timer/index.tsx        # タイマーProvider（tick駆動・永続化）
    timer/reducer.ts       # 終了予定時刻ベースの純粋reducer
    matches/index.tsx      # 人数と現在の組インデックス（試合リストは人数から導出）
    matches/consts.tsx     # 4〜10人分の総当たり的組み合わせ表（ハードコード）と getMatchList
    audio/index.tsx        # 音の種類・音量・ready/unlocked状態のProvider
    audio/engine.ts        # Web Audio + keep-alive <audio> の再生エンジン（Reactの外）
    wakeLock/              # nosleep.js による画面スリープ抑止
  hooks/
    useConfirm.tsx         # 確認モーダルを Promise で扱う
    useIsLandscape.ts      # matchMedia による横向き判定
    useFitScale.ts         # ResizeObserver による収まり拡大率
  lib/
    storage.ts             # localStorage の安全な読み書き
    settings.ts            # 設定値とセッション有無の保存・復元
  pages/Home/
    index.tsx               # トップ画面（設定、開始ボタン、音声テスト、更新通知）
    MatchTimerDialog.tsx     # フルスクリーンのタイマー実行画面（laps→試合組進行→音）
    components/
      MatchTimer.tsx          # タイマー表示・一時停止/再開/リセット
      MatchListDrawer.tsx      # 試合組一覧ドロワー
      MatchItem.tsx             # 1試合組（ペア×2）の表示（memo）
  components/
    ConfirmModal.tsx         # 汎用確認モーダル（表示のみ）
    UpdatePrompt.tsx         # PWA更新通知
```

## コマンド

- `npm run dev` — 開発サーバー
- `npm run build` — `tsc -b && vite build`（`DEPLOY_BASE_PATH` 環境変数で `base` を上書き可能。未指定時は本番と同じ `/cycle-combo/`）
- `npm run lint` — ESLint
- `npm run preview` — ビルド結果のプレビュー

このサーバ（life-server）には node が入っていない。lint/型チェック/ビルドは Docker の `node:20-alpine` で行う（npm レジストリへの接続は IPv6 で失敗するため無効化する）:

```
docker run --rm --user 1000:1000 --sysctl net.ipv6.conf.all.disable_ipv6=1 -e HOME=/tmp \
  -v "$PWD":/app -w /app node:20-alpine sh -c "npm install --no-audit --no-fund && npm run lint && npm run build"
```

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

## Issue対応状況（確認時点、要再確認）

旧 `cycle-combo-dev` 側にあった以下のIssueは、2026-07-17 のセッションで実装済み（#1〜#4）。Issueはリポジトリに紐づくため、クローズ状況は GitHub 上で確認すること。

- タイマ音の種類を増やしたい（#1、実装済み）
- 画面が勝手にスリープしないようにしてほしい（#2、実装済み）
- 音量の上限を上げてほしい（#3、実装済み）
- iOS消音モードでも鳴らしてほしい（#4、実装済みだが実機未検証。「音声の設計」参照）
- タイマーが終わりそうなことを知らせてほしい（未着手）
