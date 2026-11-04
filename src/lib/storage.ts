// localStorageへの読み書きを安全に行う薄いヘルパー。
// プライベートブラウズ等で例外になる環境でもアプリが動くよう、失敗は握りつぶす。

const PREFIX = 'cycle-combo:';

export const STORAGE_KEYS = {
	settings: 'settings',
	timer: 'timer',
	matches: 'matches',
	session: 'session',
} as const;

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export function loadJson<T>(key: StorageKey): T | undefined {
	try {
		const raw = window.localStorage.getItem(PREFIX + key);
		return raw === null ? undefined : (JSON.parse(raw) as T);
	} catch {
		return undefined;
	}
}

export function saveJson(key: StorageKey, value: unknown): void {
	try {
		window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		// 保存できなくても動作に支障はない
	}
}

export function removeJson(key: StorageKey): void {
	try {
		window.localStorage.removeItem(PREFIX + key);
	} catch {
		// 同上
	}
}
