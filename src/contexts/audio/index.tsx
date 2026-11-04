/* eslint-disable react-refresh/only-export-components -- Provider と hooks を同じファイルで公開する */
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AudioEngine, clampVolume, DEFAULT_VOLUME, isSoundType, SoundType } from "./engine";
import { loadSettings, updateSettings } from "~/lib/settings";

export { SOUND_TYPES, SOUND_TYPE_LABELS, MIN_VOLUME, MAX_VOLUME } from "./engine";
export type { SoundType } from "./engine";

// 外部公開する状態
type AudioState = {
	soundType: SoundType,
	volume: number,
	isReady: boolean,     // 音源のデコードが終わった
	isUnlocked: boolean,  // ユーザー操作で解放済みで、中断されていない（= 今鳴らせば鳴る）
}

// 外部公開する操作
type AudioActions = {
	selectSound: (soundType: SoundType) => void,
	setVolume: (volume: number) => void,
	/** タイマー実行の開始時にユーザー操作の文脈で呼ぶ。AudioContext を解放し、keep-alive を開始する。 */
	activateSession: () => Promise<void>,
	/** タイマー実行の終了時に呼ぶ。keep-alive を止める。 */
	deactivateSession: () => void,
	/** 現在選択中の音を鳴らす。鳴らせたら true。 */
	play: () => boolean,
	/** 音声テスト用。ユーザー操作の文脈で呼ぶ。 */
	playTest: () => Promise<boolean>,
}

const TEST_KEEP_ALIVE_MS = 7000;  // 音声テストの再生が終わるまで keep-alive を維持する時間（音源は約5.2秒）

const AudioStateContext = createContext<AudioState | undefined>(undefined);
const AudioActionsContext = createContext<AudioActions | undefined>(undefined);

function restoreSettings(): Pick<AudioState, 'soundType' | 'volume'> {
	const settings = loadSettings();
	return {
		soundType: isSoundType(settings.soundType) ? settings.soundType : 'chime',
		volume: typeof settings.volume === 'number' ? clampVolume(settings.volume) : DEFAULT_VOLUME,
	};
}

export const AudioProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [{ soundType, volume }, setSettings] = useState(restoreSettings);
	const [isReady, setIsReady] = useState(false);
	const [isUnlocked, setIsUnlocked] = useState(false);
	const engineRef = useRef<AudioEngine | null>(null);
	const soundTypeRef = useRef(soundType);
	const sessionActiveRef = useRef(false);
	const testTimerRef = useRef<number | undefined>(undefined);

	// エンジンはマウント時に生成し、アンマウント時に破棄する（モジュール読み込み時には何もしない）
	useEffect(() => {
		let engine: AudioEngine;
		try {
			engine = new AudioEngine(volume);
		} catch (error) {
			console.error(error);
			setIsReady(true);
			return;
		}
		engineRef.current = engine;
		setIsUnlocked(engine.isRunning);
		const unsubscribe = engine.subscribe(() => setIsUnlocked(engine.isRunning));
		engine.load().finally(() => setIsReady(true));

		return () => {
			unsubscribe();
			engine.dispose();
			engineRef.current = null;
		};
		// volume の初期値だけを渡したいので依存に含めない
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const selectSound = useCallback((next: SoundType) => {
		soundTypeRef.current = next;
		setSettings(prev => ({ ...prev, soundType: next }));
		updateSettings({ soundType: next });
	}, []);

	const setVolume = useCallback((next: number) => {
		const clamped = clampVolume(next);
		engineRef.current?.setVolume(clamped);
		setSettings(prev => ({ ...prev, volume: clamped }));
		updateSettings({ volume: clamped });
	}, []);

	const activateSession = useCallback(async () => {
		sessionActiveRef.current = true;
		window.clearTimeout(testTimerRef.current);
		const engine = engineRef.current;
		if (!engine) return;
		engine.startKeepAlive();
		await engine.unlock();
	}, []);

	const deactivateSession = useCallback(() => {
		sessionActiveRef.current = false;
		engineRef.current?.stop();
		engineRef.current?.stopKeepAlive();
	}, []);

	const play = useCallback(() => {
		return engineRef.current?.play(soundTypeRef.current) ?? false;
	}, []);

	const playTest = useCallback(async () => {
		const engine = engineRef.current;
		if (!engine) return false;
		engine.startKeepAlive();
		await engine.unlock();
		const played = engine.play(soundTypeRef.current);
		// タイマー実行中でなければ、テスト音が鳴り終わったら keep-alive を止める
		window.clearTimeout(testTimerRef.current);
		testTimerRef.current = window.setTimeout(() => {
			if (!sessionActiveRef.current) engine.stopKeepAlive();
		}, TEST_KEEP_ALIVE_MS);
		return played;
	}, []);

	const actions = useMemo<AudioActions>(() => ({
		selectSound, setVolume, activateSession, deactivateSession, play, playTest,
	}), [selectSound, setVolume, activateSession, deactivateSession, play, playTest]);

	const state = useMemo<AudioState>(() => ({
		soundType, volume, isReady, isUnlocked,
	}), [soundType, volume, isReady, isUnlocked]);

	return (
		<AudioActionsContext.Provider value={actions}>
			<AudioStateContext.Provider value={state}>
				{children}
			</AudioStateContext.Provider>
		</AudioActionsContext.Provider>
	);
}

export const useAudioState = () => {
	const context = useContext(AudioStateContext);
	if (context === undefined) {
		throw new Error('useAudioState must be within an AudioProvider');
	}
	return context;
}

export const useAudioActions = () => {
	const context = useContext(AudioActionsContext);
	if (context === undefined) {
		throw new Error('useAudioActions must be within an AudioProvider');
	}
	return context;
}
