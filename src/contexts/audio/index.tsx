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

const audioContext = new window.AudioContext();
const audioData: Partial<Record<SoundType, AudioBuffer>> = {};
(async () => {
	await Promise.all(SOUND_TYPES.map(async (type) => {
		const arrayBuffer = await fetch(SOUND_SOURCES[type]).then(r => r.arrayBuffer());
		audioData[type] = await audioContext.decodeAudioData(arrayBuffer);
	}));
})();

// 状態の型
type State = {
	source: AudioBufferSourceNode | undefined,
	soundType: SoundType,
}

// 状態の初期値
const initialState: State = {
	source: undefined,
	soundType: 'chime',
}

// 状態に対する操作の型
type Action =
	| { type: 'play' }
	| { type: 'resume' }
	| { type: 'selectSound', soundType: SoundType }

// 外部公開する操作
type ExtAction = {
	play: () => void,
	resume: () => void,
	selectSound: (soundType: SoundType) => void,
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
		source.connect(audioContext.destination);
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
	default:
		return state;
	}
}

const AudioContext = createContext<AudioContextType>({
	...initialState,
	play: () => {},
	resume: () => {},
	selectSound: () => {},
});

export const AudioProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// コンテキストのインスタンス生成
	const play = () => dispatch({ type: 'play' });
	const resume = () => dispatch({ type: 'resume' });
	const selectSound = (soundType: SoundType) => dispatch({ type: 'selectSound', soundType });
	const value = useMemo<AudioContextType>(
		() => ({
			...state,
			play,
			resume,
			selectSound,
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
