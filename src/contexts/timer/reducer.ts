// タイマーは「残り秒数を1秒ごとに減らす」のではなく「終了予定時刻(endAt)」を持ち、
// 表示のたびに現在時刻との差分から残り時間を求める。
// これにより、バックグラウンドでJSが止まっても復帰時に実時間どおりの残り時間になり、
// 止まっている間に終了時刻を過ぎていれば laps（周回数）が進む。

// 状態の型
export type TimerState = {
	durationMs: number,          // 1周の長さ
	remainingMs: number,         // 残り時間（走行中は tick で更新、停止中は確定値）
	endAt: number | null,        // 走行中のみ: 現在の周の終了予定時刻（epoch ms）
	isRunning: boolean,
	laps: number,                // 終了した周の数。終了するたびに増え、タイマーは自動で次の周に入る
}

// 状態の初期値
export const initialState: TimerState = {
	durationMs: 0,
	remainingMs: 0,
	endAt: null,
	isRunning: false,
	laps: 0,
}

// 状態に対する操作の型（時刻はアクションで受け取り、reducerを純粋に保つ）
export type TimerAction =
	| { type: 'begin', durationMs: number, now: number }
	| { type: 'end' }
	| { type: 'start', now: number }
	| { type: 'pause', now: number }
	| { type: 'reset', now: number }
	| { type: 'tick', now: number }

export const toSec = (ms: number) => Math.max(0, Math.ceil(ms / 1000));

export const reducer = (state: TimerState, action: TimerAction): TimerState => {
	switch (action.type) {
	case 'begin':
		return {
			durationMs: action.durationMs,
			remainingMs: action.durationMs,
			endAt: action.now + action.durationMs,
			isRunning: true,
			laps: 0,
		}
	case 'end':
		return initialState;
	case 'start':
		if (state.isRunning || state.durationMs <= 0) return state;
		return {
			...state,
			isRunning: true,
			endAt: action.now + state.remainingMs,
		}
	case 'pause':
		if (!state.isRunning || state.endAt === null) return state;
		return {
			...state,
			isRunning: false,
			endAt: null,
			remainingMs: Math.max(0, state.endAt - action.now),
		}
	case 'reset':
		return {
			...state,
			remainingMs: state.durationMs,
			endAt: state.isRunning ? action.now + state.durationMs : null,
		}
	case 'tick': {
		if (!state.isRunning || state.endAt === null || state.durationMs <= 0) return state;

		let endAt = state.endAt;
		let laps = state.laps;
		let remainingMs = endAt - action.now;
		if (remainingMs <= 0) {
			// 終了時刻を過ぎていれば、過ぎた分だけ周回を進める（長時間離れていた場合は複数周進む）
			const passed = 1 + Math.floor(-remainingMs / state.durationMs);
			laps += passed;
			endAt += passed * state.durationMs;
			remainingMs = endAt - action.now;
		}

		// 表示秒が変わらないなら状態を更新しない（毎tickの再描画を避ける）
		if (laps === state.laps && toSec(remainingMs) === toSec(state.remainingMs)) return state;
		return { ...state, endAt, laps, remainingMs };
	}
	default:
		return state;
	}
}
