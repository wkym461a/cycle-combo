import React, { createContext, PropsWithChildren, useContext, useMemo, useReducer } from "react";

// 状態の型
type Pair = [number, number];
type Match = [Pair, Pair];
type State = {
	matches: Match[],
}

// 状態の初期値
const initialState: State = {
	matches: [],
}

// 状態に対する操作の型
type Action =
	| { type: 'create', peopleNum: number }
	| { type: 'clear' }

// 外部公開する操作
type ExtAction = {
	createMatches: (peopleNum: number) => void,
	clearMatches: () => void,
}

// コンテキスト型（状態と公開操作の組み合わせ）
type MatchContextType = State & ExtAction;

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
	case 'create':
		return {
			...state,
			matches: Array(action.peopleNum).map((_, i) => (
				[[i+1, i+1], [i+1, i+1]]
			)),
		}
		case 'clear':
			return {
				...state,
				matches: [],
		}
	default:
		return state;
	}
}

const MatchContext = createContext<MatchContextType>({
	...initialState,
	createMatches: (_: number) => {},
	clearMatches: () => {},
});

export const MatchProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// コンテキストのインスタンス生成
	const createMatches = (peopleNum: number) => dispatch({ type: 'create', peopleNum });
	const clearMatches = () => dispatch({ type: 'clear' });
	const value = useMemo<MatchContextType>(
		() => ({
			...state,
			createMatches,
			clearMatches,
		}),
		[state],
	);

	return <MatchContext.Provider value={value} {...props} />;
}

export const useMatch = () => {
	const context = useContext(MatchContext);

  if (typeof context === 'undefined') {
    throw new Error('useMatch must be within a MatchProvider');
  }

  return context;
}
