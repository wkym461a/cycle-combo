import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

declare const process: { env: Record<string, string | undefined> };

// main push → /cycle-combo/dev/、vX.Y.Z タグ push → /cycle-combo/（.github/workflows/deploy-gh-pages.yml）
const base = process.env.DEPLOY_BASE_PATH ?? "/cycle-combo/";

// 開発版（dev/ 配信）か本番かをアプリに埋め込む。ホーム画面のバージョン表記で「開発版」ラベルを出すのに使う
const deployChannel: 'dev' | 'prod' = base === "/cycle-combo/dev/" ? 'dev' : 'prod';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		react(),
		tsconfigPaths(),
		VitePWA({
      // 新バージョンは自動リロードせず、ユーザー操作で更新する（タイマー実行中のリロードを防ぐ。src/components/UpdatePrompt.tsx）
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      injectRegister: 'auto',
      manifest: {
        name: 'バドミントン部タイマ',
        short_name: 'バド部タイマ',
        description: 'ダブルス競技向けインターバルタイマ',
        lang: 'ja',
        // dev/ とルートで2つの Service Worker が同居するため、scope と start_url を base に揃えて明示する
        id: base,
        scope: base,
        start_url: base,
        display: 'standalone',
        orientation: 'any',
        theme_color: '#2c2c2c',
        background_color: '#2c2c2c',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
		}),
	],
  base,
  define: {
    'import.meta.env.VITE_DEPLOY_CHANNEL': JSON.stringify(deployChannel),
  },
	css: {
		modules: {
			localsConvention: 'dashes',
		},
	},
});
