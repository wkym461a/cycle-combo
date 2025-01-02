import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		react(),
		tsconfigPaths(),
		VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/favicon.ico', 'assets/apple-touch-icon.png'],
      injectRegister: 'auto',
      manifest: {
        name: 'バドミントン部タイマ',
        short_name: 'バド部タイマ',
        description: 'ダブルス競技向けインターバルタイマ',
        theme_color: '#008080',
        icons: [
          {
            src: 'assets/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'assets/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'assets/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'assets/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
		}),
	],
  base: "/cycle-combo/",
	css: {
		modules: {
			localsConvention: 'dashes',
		},
	},
});
