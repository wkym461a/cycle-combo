import React, { createContext, PropsWithChildren, useContext, useMemo, useReducer } from "react";
import { Match, MatchLists } from "./consts";

// 状態の型
type State = {
	peopleNum: number,
	matches: Match[],
	currentMatchIndex: number,
}

// 状態の初期値
const initialState: State = {
	peopleNum: 0,
	matches: [],
	currentMatchIndex: 0,
}

// 状態に対する操作の型
type Action =
	| { type: 'create', peopleNum: number }
	| { type: 'next' }
	| { type: 'jump', index: number }
	| { type: 'clear' }

// 外部公開する操作
type ExtAction = {
	createMatches: (peopleNum: number) => void,
	nextMatch: () => void,
	jumpMatch: (index: number) => void,
	clearMatches: () => void,
}

// コンテキスト型（状態と公開操作の組み合わせ）
type MatchesContextType = State & ExtAction;

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
	case 'create':
		return (4 <= action.peopleNum && action.peopleNum < MatchLists.length + 4)
			? {
				...state,
				peopleNum: action.peopleNum,
				matches: MatchLists[action.peopleNum - 4],
				currentMatchIndex: 0,
			}
			: {
				...state,
				peopleNum: 0,
				matches: [],
				currentMatchIndex: 0,
			};
	case 'next':
		return ((state.matches.length > 1) && (0 <= state.currentMatchIndex && state.currentMatchIndex < state.matches.length - 1))
			? {
				...state,
				currentMatchIndex: state.currentMatchIndex + 1,
			}
			: state;
	case 'jump':
		return ((state.matches.length > 0) && (0 <= action.index && action.index < state.matches.length))
			? {
				...state,
				currentMatchIndex: action.index,
			}
			: state;
	case 'clear':
		return {
			...state,
			peopleNum: 0,
			matches: [],
			currentMatchIndex: 0,
		}
	default:
		return state;
	}
}

const MatchesContext = createContext<MatchesContextType>({
	...initialState,
	createMatches: (_: number) => {},
	nextMatch: () => {},
	jumpMatch: (_: number) => {},
	clearMatches: () => {},
});

export const MatchesProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// コンテキストのインスタンス生成
	const createMatches = (peopleNum: number) => dispatch({ type: 'create', peopleNum });
	const nextMatch = () => dispatch({ type: 'next' });
	const jumpMatch = (index: number) => dispatch({ type: 'jump', index });
	const clearMatches = () => dispatch({ type: 'clear' });
	const value = useMemo<MatchesContextType>(
		() => ({
			...state,
			createMatches,
			nextMatch,
			jumpMatch,
			clearMatches,
		}),
		[state],
	);

	return <MatchesContext.Provider value={value} {...props} />;
}

export const useMatches = () => {
	const context = useContext(MatchesContext);

  if (typeof context === 'undefined') {
    throw new Error('useMatches must be within a MatchesProvider');
  }

  return context;
}

export type { Match };
