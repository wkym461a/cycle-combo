/* eslint-disable react-refresh/only-export-components -- Provider と hooks を同じファイルで公開する */
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { getMatchList, Match } from "./consts";
import { loadJson, saveJson, STORAGE_KEYS } from "~/lib/storage";

// 状態の型（試合リストは人数から導出できるので、人数と現在位置だけを持つ）
type State = {
	peopleNum: number,
	currentMatchIndex: number,
}

// 状態の初期値
const initialState: State = {
	peopleNum: 0,
	currentMatchIndex: 0,
}

// 状態に対する操作の型
type Action =
	| { type: 'create', peopleNum: number }
	| { type: 'advance', count: number }
	| { type: 'jump', index: number }
	| { type: 'clear' }

// 外部公開する操作
type MatchesActions = {
	createMatches: (peopleNum: number) => void,
	advanceMatch: (count?: number) => void,
	jumpMatch: (index: number) => void,
	clearMatches: () => void,
}

// 外部公開する状態
type MatchesStateValue = State & {
	matches: Match[],
}

const reducer = (state: State, action: Action): State => {
	switch (action.type) {
	case 'create':
		return (getMatchList(action.peopleNum).length > 0)
			? { peopleNum: action.peopleNum, currentMatchIndex: 0 }
			: initialState;
	case 'advance': {
		const length = getMatchList(state.peopleNum).length;
		if (length === 0 || action.count <= 0) return state;
		return {
			...state,
			currentMatchIndex: (state.currentMatchIndex + action.count) % length,
		}
	}
	case 'jump': {
		const length = getMatchList(state.peopleNum).length;
		return (0 <= action.index && action.index < length)
			? { ...state, currentMatchIndex: action.index }
			: state;
	}
	case 'clear':
		return initialState;
	default:
		return state;
	}
}

function restoreState(): State {
	const saved = loadJson<State>(STORAGE_KEYS.matches);
	if (
		saved &&
		typeof saved.peopleNum === 'number' &&
		typeof saved.currentMatchIndex === 'number' &&
		0 <= saved.currentMatchIndex && saved.currentMatchIndex < getMatchList(saved.peopleNum).length
	) {
		return saved;
	}
	return initialState;
}

const MatchesStateContext = createContext<MatchesStateValue | undefined>(undefined);
const MatchesActionsContext = createContext<MatchesActions | undefined>(undefined);

export const MatchesProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, undefined, restoreState);

	const actions = useMemo<MatchesActions>(() => ({
		createMatches: (peopleNum) => dispatch({ type: 'create', peopleNum }),
		advanceMatch: (count = 1) => dispatch({ type: 'advance', count }),
		jumpMatch: (index) => dispatch({ type: 'jump', index }),
		clearMatches: () => dispatch({ type: 'clear' }),
	}), []);

	useEffect(() => {
		saveJson(STORAGE_KEYS.matches, state.peopleNum > 0 ? state : null);
	}, [state]);

	const stateValue = useMemo<MatchesStateValue>(() => ({
		...state,
		matches: getMatchList(state.peopleNum),
	}), [state]);

	return (
		<MatchesActionsContext.Provider value={actions}>
			<MatchesStateContext.Provider value={stateValue}>
				{children}
			</MatchesStateContext.Provider>
		</MatchesActionsContext.Provider>
	);
}

export const useMatchesState = () => {
	const context = useContext(MatchesStateContext);
	if (context === undefined) {
		throw new Error('useMatchesState must be within a MatchesProvider');
	}
	return context;
}

export const useMatchesActions = () => {
	const context = useContext(MatchesActionsContext);
	if (context === undefined) {
		throw new Error('useMatchesActions must be within a MatchesProvider');
	}
	return context;
}

export type { Match };
