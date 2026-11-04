/* eslint-disable react-refresh/only-export-components -- Provider と hooks を同じファイルで公開する */
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { loadJson, saveJson, STORAGE_KEYS } from "~/lib/storage";
import { initialState, reducer, TimerState, toSec } from "./reducer";

export type { TimerState } from "./reducer";

// 外部公開する操作
type TimerActions = {
	beginTimer: (durationMs: number) => void,
	endTimer: () => void,
	startTimer: () => void,
	pauseTimer: () => void,
	resetTimer: () => void,
}

// 外部公開する状態（表示用の残り秒数を付加）
type TimerStateValue = TimerState & {
	remainingSec: number,
}

const TICK_INTERVAL_MS = 250;

function restoreState(): TimerState {
	const saved = loadJson<TimerState>(STORAGE_KEYS.timer);
	if (
		saved &&
		typeof saved.durationMs === 'number' && saved.durationMs > 0 &&
		typeof saved.remainingMs === 'number' &&
		(saved.endAt === null || typeof saved.endAt === 'number') &&
		typeof saved.isRunning === 'boolean' &&
		typeof saved.laps === 'number'
	) {
		return saved;
	}
	return initialState;
}

const TimerStateContext = createContext<TimerStateValue | undefined>(undefined);
const TimerActionsContext = createContext<TimerActions | undefined>(undefined);

export const TimerProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, undefined, restoreState);

	// 操作は dispatch にしか依存しないので一度だけ生成する
	const actions = useMemo<TimerActions>(() => ({
		beginTimer: (durationMs) => dispatch({ type: 'begin', durationMs, now: Date.now() }),
		endTimer: () => dispatch({ type: 'end' }),
		startTimer: () => dispatch({ type: 'start', now: Date.now() }),
		pauseTimer: () => dispatch({ type: 'pause', now: Date.now() }),
		resetTimer: () => dispatch({ type: 'reset', now: Date.now() }),
	}), []);

	// 走行中は定期的に、またページが前面に戻ったときに即座に残り時間を再計算する
	useEffect(() => {
		if (!state.isRunning) return;

		const tick = () => dispatch({ type: 'tick', now: Date.now() });
		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') tick();
		};

		tick();
		const intervalID = window.setInterval(tick, TICK_INTERVAL_MS);
		document.addEventListener('visibilitychange', onVisibilityChange);
		window.addEventListener('pageshow', tick);
		window.addEventListener('focus', tick);

		return () => {
			window.clearInterval(intervalID);
			document.removeEventListener('visibilitychange', onVisibilityChange);
			window.removeEventListener('pageshow', tick);
			window.removeEventListener('focus', tick);
		};
	}, [state.isRunning]);

	// 永続化（毎秒の tick では endAt が変わらないので書き込みは起きない）
	useEffect(() => {
		if (state.durationMs <= 0) {
			saveJson(STORAGE_KEYS.timer, null);
		} else {
			saveJson(STORAGE_KEYS.timer, state);
		}
		// remainingMs は停止時（isRunning の変化時）に確定するので依存に含めなくてよい
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.durationMs, state.endAt, state.isRunning, state.laps]);

	const stateValue = useMemo<TimerStateValue>(() => ({
		...state,
		remainingSec: toSec(state.remainingMs),
	}), [state]);

	return (
		<TimerActionsContext.Provider value={actions}>
			<TimerStateContext.Provider value={stateValue}>
				{children}
			</TimerStateContext.Provider>
		</TimerActionsContext.Provider>
	);
}

export const useTimerState = () => {
	const context = useContext(TimerStateContext);
	if (context === undefined) {
		throw new Error('useTimerState must be within a TimerProvider');
	}
	return context;
}

export const useTimerActions = () => {
	const context = useContext(TimerActionsContext);
	if (context === undefined) {
		throw new Error('useTimerActions must be within a TimerProvider');
	}
	return context;
}
