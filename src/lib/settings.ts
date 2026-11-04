import { loadJson, saveJson, STORAGE_KEYS } from './storage';

// ホーム画面で選ぶ設定値。次回起動時に復元する。
export type Settings = {
	timerMin: number,
	peopleNum: number,   // 0 = なし
	soundType: string,   // 実際の検証は audio 側で行う
	volume: number,
};

export function loadSettings(): Partial<Settings> {
	const loaded = loadJson<Partial<Settings>>(STORAGE_KEYS.settings);
	return (loaded && typeof loaded === 'object') ? loaded : {};
}

export function updateSettings(patch: Partial<Settings>): void {
	saveJson(STORAGE_KEYS.settings, { ...loadSettings(), ...patch });
}

// タイマー実行画面を開いているかどうか。リロード後に実行画面へ復帰するために使う。
type Session = { active: boolean };

export function loadSessionActive(): boolean {
	return loadJson<Session>(STORAGE_KEYS.session)?.active === true;
}

export function saveSessionActive(active: boolean): void {
	saveJson(STORAGE_KEYS.session, { active } satisfies Session);
}
