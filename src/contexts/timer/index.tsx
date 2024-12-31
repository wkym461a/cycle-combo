import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";

const InitialTimer = 5 * 60;

// 状態の型
type State = {
	timer_s: number,
	isRunning: boolean,
}

// 状態の初期値
const initialState: State = {
	timer_s: InitialTimer,
	isRunning: true,
}

// 状態に対する操作の型
type Action =
	| { type: 'decrement' }
	| { type: 'start' }
	| { type: 'stop' }
	| { type: 'reset' }

// 外部公開する操作
type ExtAction = {
	startTimer: () => void,
	stopTimer: () => void,
	resetTimer: () => void,
}

// コンテキスト型（状態と公開操作の組み合わせ）
type TimerContextType = State & ExtAction;

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
	case 'decrement':
		return {
			...state,
			timer_s: Math.max(state.timer_s - 1, 0),
		}
	case 'start':
		return {
			...state,
			isRunning: true,
		}
	case 'stop':
		return {
			...state,
			isRunning: false,
		}
	case 'reset':
		return {
			...state,
			timer_s: initialState.timer_s,
		}
	default:
		return state;
	}
}

const TimerContext = createContext<TimerContextType>({
	...initialState,
	startTimer: () => {},
	stopTimer: () => {},
	resetTimer: () => {},
});

let timeoutID: number | undefined = undefined;
export const TimerProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// コンテキストのインスタンス生成
	const startTimer = () => dispatch({ type: 'start' });
	const stopTimer = () => dispatch({ type: 'stop' });
	const resetTimer = () => dispatch({ type: 'reset' });
	const value = useMemo<TimerContextType>(
		() => ({
			...state,
			startTimer,
			stopTimer,
			resetTimer,
		}),
		[state],
	);

	// カウントダウン処理
	const decrementTimer = () => dispatch({ type: 'decrement' });
	useEffect(() => {
		if ((!state.isRunning) || (state.timer_s <= 0)) {
			window.clearTimeout(timeoutID);
			timeoutID = undefined;
			return;
		}

		// タイマカウントダウン設定
		window.clearTimeout(timeoutID);
		timeoutID = window.setTimeout(() => {
			decrementTimer();

			if (state.timer_s <= 1) {
				resetTimer();
				// play();
			}
		}, 1000);

	}, [state]);

	return <TimerContext.Provider value={value} {...props} />;
}

export const useTimer = () => {
	const context = useContext(TimerContext);

  if (typeof context === 'undefined') {
    throw new Error('useTimer must be within a TimerProvider');
  }

  return context;
}
