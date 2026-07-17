import React, { createContext, PropsWithChildren, useContext, useMemo, useReducer } from "react";
import soundChime from '~/assets/timer.mp3';
import soundBeep from '~/assets/sound-beep.wav';
import soundBell from '~/assets/sound-bell.wav';

export const SOUND_TYPES = ['chime', 'beep', 'bell'] as const;
export type SoundType = typeof SOUND_TYPES[number];

export const SOUND_TYPE_LABELS: Record<SoundType, string> = {
	chime: 'チャイム',
	beep: 'ビープ',
	bell: 'ベル',
};

const SOUND_SOURCES: Record<SoundType, string> = {
	chime: soundChime,
	beep: soundBeep,
	bell: soundBell,
};

export const MIN_VOLUME = 0.5;
export const MAX_VOLUME = 3;
const DEFAULT_VOLUME = 1.5;

const audioContext = new window.AudioContext();
const audioData: Partial<Record<SoundType, AudioBuffer>> = {};
(async () => {
	await Promise.all(SOUND_TYPES.map(async (type) => {
		const arrayBuffer = await fetch(SOUND_SOURCES[type]).then(r => r.arrayBuffer());
		audioData[type] = await audioContext.decodeAudioData(arrayBuffer);
	}));
})();

// 100%(1.0)を超える音量までブーストできるようGainNodeを挟む。
// ブースト時の歪み・クリッピングを抑えるためDynamicsCompressorNodeを後段に置く。
const gainNode = audioContext.createGain();
const compressorNode = audioContext.createDynamicsCompressor();
gainNode.gain.value = DEFAULT_VOLUME;
gainNode.connect(compressorNode);
compressorNode.connect(audioContext.destination);

// 状態の型
type State = {
	source: AudioBufferSourceNode | undefined,
	soundType: SoundType,
	volume: number,
}

// 状態の初期値
const initialState: State = {
	source: undefined,
	soundType: 'chime',
	volume: DEFAULT_VOLUME,
}

// 状態に対する操作の型
type Action =
	| { type: 'play' }
	| { type: 'resume' }
	| { type: 'selectSound', soundType: SoundType }
	| { type: 'setVolume', volume: number }

// 外部公開する操作
type ExtAction = {
	play: () => void,
	resume: () => void,
	selectSound: (soundType: SoundType) => void,
	setVolume: (volume: number) => void,
}

// コンテキスト型（状態と公開操作の組み合わせ）
type AudioContextType = State & ExtAction;

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
	case 'play': {
		state.source?.stop();
		state.source?.disconnect();
		const source = audioContext.createBufferSource();
		source.buffer = audioData[state.soundType] ?? null;
		source.connect(gainNode);
		source.start(0);
		return {
			...state,
			source,
		}
	}
	case 'resume': {
		audioContext.resume();
		return state;
	}
	case 'selectSound': {
		return {
			...state,
			soundType: action.soundType,
		}
	}
	case 'setVolume': {
		const volume = Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, action.volume));
		gainNode.gain.value = volume;
		return {
			...state,
			volume,
		}
	}
	default:
		return state;
	}
}

const AudioContext = createContext<AudioContextType>({
	...initialState,
	play: () => {},
	resume: () => {},
	selectSound: () => {},
	setVolume: () => {},
});

export const AudioProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// コンテキストのインスタンス生成
	const play = () => dispatch({ type: 'play' });
	const resume = () => dispatch({ type: 'resume' });
	const selectSound = (soundType: SoundType) => dispatch({ type: 'selectSound', soundType });
	const setVolume = (volume: number) => dispatch({ type: 'setVolume', volume });
	const value = useMemo<AudioContextType>(
		() => ({
			...state,
			play,
			resume,
			selectSound,
			setVolume,
		}),
		[state],
	);

	return <AudioContext.Provider value={value} {...props} />;
}

export const useAudio = () => {
	const context = useContext(AudioContext);

  if (typeof context === 'undefined') {
    throw new Error('useAudio must be within a AudioProvider');
  }

  return context;
}
