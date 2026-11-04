/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module '*.module.css' {
	const classes: { [key: string]: string };
	export default classes;
}
