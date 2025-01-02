import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";

let timeoverAction: () => void = () => console.log(`Timer: timeover action`);
export function setTimeoverAction(action: () => void) {
	timeoverAction = action;
}

// 状態の型
type State = {
	initTimer_s: number,
	timer_s: number,
	isRunning: boolean,
}

// 状態の初期値
const initialState: State = {
	initTimer_s: 0,
	timer_s: 0,
	isRunning: false,
}

// 状態に対する操作の型
type Action =
	| { type: 'countdown' }
	| { type: 'set-init', initTimer_s: number }
	| { type: 'start' }
	| { type: 'stop' }
	| { type: 'reset' }

// 外部公開する操作
type ExtAction = {
	setInitTimer: (initTimer_s: number) => void,
	startTimer: () => void,
	stopTimer: () => void,
	resetTimer: () => void,
}

// コンテキスト型（状態と公開操作の組み合わせ）
type TimerContextType = State & ExtAction;

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
	case 'countdown':
		return {
			...state,
			timer_s: Math.max(state.timer_s - 1, 0),
		}
	case 'set-init':
		return {
			...state,
			initTimer_s: action.initTimer_s,
			timer_s: action.initTimer_s,
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
			timer_s: state.initTimer_s,
		}
	default:
		return state;
	}
}

const TimerContext = createContext<TimerContextType>({
	...initialState,
	setInitTimer: (_: number) => {},
	startTimer: () => {},
	stopTimer: () => {},
	resetTimer: () => {},
});

let timeoutID: number | undefined = undefined;
export const TimerProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// コンテキストのインスタンス生成
	const setInitTimer = (initTimer_s: number) => dispatch({ type: 'set-init', initTimer_s });
	const startTimer = () => dispatch({ type: 'start' });
	const stopTimer = () => dispatch({ type: 'stop' });
	const resetTimer = () => dispatch({ type: 'reset' });
	const value = useMemo<TimerContextType>(
		() => ({
			...state,
			setInitTimer,
			startTimer,
			stopTimer,
			resetTimer,
		}),
		[state],
	);

	// カウントダウン処理
	const countdownTimer = () => dispatch({ type: 'countdown' });
	useEffect(() => {
		if (
			(state.initTimer_s <= 0) ||
			(!state.isRunning) ||
			(state.timer_s <= 0)
		) {
			window.clearTimeout(timeoutID);
			timeoutID = undefined;
			return;
		}

		// タイマカウントダウン設定
		window.clearTimeout(timeoutID);
		timeoutID = window.setTimeout(() => {
			countdownTimer();

			if (state.timer_s <= 1) {
				resetTimer();
				timeoverAction();
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
