/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
	/** package.json の version（.env で $npm_package_version を参照） */
	readonly VITE_VERSION: string;
	/** 配信先。'dev' は開発版（/cycle-combo/dev/）、'prod' は本番。vite.config.ts の define で埋め込む */
	readonly VITE_DEPLOY_CHANNEL: 'dev' | 'prod';
}

declare module '*.module.css' {
	const classes: { [key: string]: string };
	export default classes;
}
