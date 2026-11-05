/* eslint-disable react-refresh/only-export-components -- Provider と hooks を同じファイルで公開する */
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from "react";
import { getMatchList, Match, Pair } from "./consts";
import { loadJson, saveJson, STORAGE_KEYS } from "~/lib/storage";

// 状態の型。試合リストは「人数に対応する固定表」と「番号の置換」から導出できるので、
// 人数・置換・現在位置だけを持つ。
type State = {
	peopleNum: number,
	// 固定表の番号 i（1始まり）を permutation[i-1] に置き換える。開始時にランダムに決める。
	// 固定表は「同じ人」「同じペア」「同じ4人組」の再登場間隔だけを最適化してあり、番号の大小は使って
	// いないので、どう置き換えても表の品質は変わらず、誰が休むか・誰と組むかだけが毎回変わる。
	permutation: number[],
	currentMatchIndex: number,
}

// 状態の初期値
const initialState: State = {
	peopleNum: 0,
	permutation: [],
	currentMatchIndex: 0,
}

// 状態に対する操作の型
type Action =
	| { type: 'create', peopleNum: number, permutation: number[] }
	| { type: 'advance', count: number }
	| { type: 'jump', index: number }
	| { type: 'clear' }

// 1..n をランダムに並べ替える（Fisher–Yates）
function shufflePlayers(n: number): number[] {
	const players = [...Array(n)].map((_, i) => i + 1);
	for (let i = players.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[players[i], players[j]] = [players[j], players[i]];
	}
	return players;
}

function isPermutationOf(value: unknown, n: number): value is number[] {
	if (!Array.isArray(value) || value.length !== n) return false;
	const sorted = value.map(Number).sort((a, b) => a - b);
	return sorted.every((v, i) => v === i + 1);
}

// 固定表に番号の置換を適用した試合リスト。
// 固定表は左右反転した同じ試合（12-34 と 34-12）を持たないので、1周したら左右を入れ替えた2周目を続け、
// 2周で元に戻る。リストの長さは固定表の2倍になる。
function buildMatches(peopleNum: number, permutation: number[]): Match[] {
	const table = getMatchList(peopleNum);
	if (table.length === 0 || !isPermutationOf(permutation, peopleNum)) return [];
	const relabel = (pair: Pair): Pair => [permutation[pair[0] - 1], permutation[pair[1] - 1]];
	const firstLap = table.map(([left, right]): Match => [relabel(left), relabel(right)]);
	const secondLap = firstLap.map(([left, right]): Match => [right, left]);
	return [...firstLap, ...secondLap];
}

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
		return (buildMatches(action.peopleNum, action.permutation).length > 0)
			? { peopleNum: action.peopleNum, permutation: action.permutation, currentMatchIndex: 0 }
			: initialState;
	case 'advance': {
		const length = buildMatches(state.peopleNum, state.permutation).length;
		if (length === 0 || action.count <= 0) return state;
		return {
			...state,
			currentMatchIndex: (state.currentMatchIndex + action.count) % length,
		}
	}
	case 'jump': {
		const length = buildMatches(state.peopleNum, state.permutation).length;
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
		isPermutationOf(saved.permutation, saved.peopleNum) &&
		typeof saved.currentMatchIndex === 'number' &&
		0 <= saved.currentMatchIndex && saved.currentMatchIndex < buildMatches(saved.peopleNum, saved.permutation).length
	) {
		return { peopleNum: saved.peopleNum, permutation: saved.permutation, currentMatchIndex: saved.currentMatchIndex };
	}
	return initialState;
}

const MatchesStateContext = createContext<MatchesStateValue | undefined>(undefined);
const MatchesActionsContext = createContext<MatchesActions | undefined>(undefined);

export const MatchesProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, undefined, restoreState);

	const actions = useMemo<MatchesActions>(() => ({
		// 置換は reducer を純粋に保つためここで決める
		createMatches: (peopleNum) => dispatch({ type: 'create', peopleNum, permutation: shufflePlayers(peopleNum) }),
		advanceMatch: (count = 1) => dispatch({ type: 'advance', count }),
		jumpMatch: (index) => dispatch({ type: 'jump', index }),
		clearMatches: () => dispatch({ type: 'clear' }),
	}), []);

	useEffect(() => {
		saveJson(STORAGE_KEYS.matches, state.peopleNum > 0 ? state : null);
	}, [state]);

	const stateValue = useMemo<MatchesStateValue>(() => ({
		...state,
		matches: buildMatches(state.peopleNum, state.permutation),
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
