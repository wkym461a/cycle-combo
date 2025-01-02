
export type Pair = [number, number];
export type Match = [Pair, Pair];

const matchList4: Match[] = [
	[[1, 2], [3, 4]],
	[[1, 3], [2, 4]],
	[[1, 4], [2, 3]],
];

const matchList5: Match[] = [
	[[1, 2], [3, 4]],
	[[5, 1], [2, 3]],
	[[4, 5], [1, 3]],
	[[2, 4], [5, 3]],
	[[1, 4], [2, 5]],
	[[3, 1], [2, 4]],
	[[5, 3], [1, 2]],
	[[4, 3], [5, 1]],
	[[2, 3], [4, 5]],
	[[1, 4], [2, 5]],
	[[3, 2], [1, 4]],
	[[5, 2], [1, 3]],
	[[4, 3], [5, 1]],
	[[2, 4], [5, 3]],
	[[1, 2], [4, 5]],
	[[3, 2], [1, 4]],
	[[5, 2], [1, 3]],
	[[4, 3], [5, 1]],
	[[2, 4], [5, 3]],
	[[1, 2], [4, 5]],
	[[3, 1], [2, 4]],
	[[5, 1], [2, 3]],
	[[4, 1], [5, 3]],
	[[2, 5], [4, 3]],
	[[1, 2], [4, 5]],
	[[3, 4], [1, 2]],
	[[5, 1], [2, 3]],
	[[4, 5], [1, 3]],
	[[2, 4], [5, 3]],
	[[1, 4], [2, 5]],
];

const matchList6: Match[] = [
	[[1, 2], [3, 4]],
	[[5, 6], [1, 3]],
	[[2, 5], [4, 6]],
	[[1, 5], [3, 2]],
	[[4, 2], [6, 3]],
	[[1, 6], [5, 4]],
	[[3, 5], [1, 4]],
	[[2, 6], [1, 3]],
	[[4, 2], [5, 6]],
	[[3, 2], [4, 5]],
	[[1, 6], [3, 4]],
	[[2, 6], [5, 1]],
	[[4, 1], [2, 5]],
	[[3, 6], [1, 2]],
	[[4, 6], [5, 3]],
	[[1, 3], [4, 5]],
	[[2, 6], [1, 4]],
	[[3, 6], [5, 2]],
	[[1, 5], [4, 2]],
	[[3, 4], [6, 1]],
	[[2, 3], [5, 6]],
	[[1, 2], [3, 5]],
	[[4, 6], [1, 2]],
	[[3, 6], [5, 4]],
	[[1, 4], [2, 5]],
	[[3, 1], [6, 2]],
	[[4, 6], [5, 3]],
	[[1, 5], [2, 3]],
	[[4, 2], [6, 1]],
	[[3, 4], [5, 6]],
];

const matchList7: Match[] = [
	[[1, 2], [3, 4]],
	[[5, 6], [7, 1]],
	[[3, 5], [4, 6]],
	[[2, 7], [1, 3]],
	[[4, 2], [6, 7]],
	[[5, 1], [3, 2]],
	[[4, 7], [6, 5]],
	[[1, 4], [2, 5]],
	[[3, 7], [6, 1]],
	[[4, 5], [3, 6]],
	[[2, 4], [7, 1]],
	[[5, 7], [6, 2]],
	[[3, 1], [4, 5]],
	[[2, 3], [6, 7]],
	[[1, 2], [5, 3]],
	[[4, 6], [7, 2]],
	[[1, 5], [3, 6]],
	[[4, 1], [7, 3]],
	[[2, 5], [4, 7]],
	[[6, 2], [3, 4]],
	[[1, 6], [5, 7]],
	[[2, 4], [1, 5]],
	[[3, 1], [6, 7]],
	[[2, 3], [5, 6]],
	[[4, 3], [7, 2]],
	[[1, 7], [5, 4]],
	[[6, 3], [1, 4]],
	[[2, 6], [5, 7]],
	[[1, 2], [3, 5]],
	[[4, 7], [6, 1]],
];

const matchList8: Match[] = [
	[[1, 2], [3, 4]],
	[[5, 6], [7, 8]],
	[[1, 5], [2, 6]],
	[[3, 7], [4, 8]],
	[[1, 6], [2, 5]],
	[[3, 8], [4, 7]],
	[[5, 3], [6, 4]],
	[[1, 7], [2, 8]],
	[[3, 6], [4, 1]],
	[[5, 8], [2, 7]],
	[[1, 3], [4, 5]],
	[[6, 7], [2, 8]],
	[[3, 2], [5, 6]],
	[[1, 8], [4, 7]],
	[[2, 4], [3, 5]],
	[[6, 8], [1, 7]],
	[[2, 6], [3, 4]],
	[[5, 7], [1, 8]],
	[[2, 5], [4, 6]],
	[[3, 1], [7, 8]],
	[[5, 1], [6, 3]],
	[[2, 7], [4, 8]],
	[[1, 6], [2, 4]],
	[[3, 7], [5, 8]],
	[[1, 2], [4, 5]],
	[[6, 7], [3, 8]],
	[[1, 4], [2, 3]],
	[[5, 7], [6, 8]],
	[[1, 4], [5, 6]],
	[[2, 3], [7, 8]],
];

const matchList9: Match[] = [
	[[1, 2], [3, 4]],
	[[5, 6], [7, 8]],
	[[9, 1], [2, 5]],
	[[3, 7], [4, 8]],
	[[6, 9], [1, 3]],
	[[2, 4], [5, 8]],
	[[7, 6], [9, 2]],
	[[3, 6], [4, 5]],
	[[1, 8], [7, 9]],
	[[2, 6], [3, 5]],
	[[4, 1], [8, 9]],
	[[7, 1], [2, 3]],
	[[5, 9], [4, 7]],
	[[6, 1], [8, 2]],
	[[3, 9], [5, 7]],
	[[4, 6], [8, 3]],
	[[2, 7], [9, 4]],
	[[1, 5], [6, 8]],
	[[2, 1], [4, 7]],
	[[3, 5], [9, 8]],
	[[6, 7], [1, 4]],
	[[2, 9], [8, 6]],
	[[3, 1], [5, 7]],
	[[2, 8], [9, 3]],
	[[4, 5], [6, 1]],
	[[7, 2], [3, 8]],
	[[9, 4], [5, 6]],
	[[1, 8], [2, 3]],
	[[7, 9], [4, 6]],
	[[5, 1], [8, 4]],
];

const matchList10: Match[] = [
	[[ 1,  2], [ 3,  4]],
	[[ 5,  6], [ 7,  8]],
	[[ 9, 10], [ 1,  3]],
	[[ 2,  4], [ 5,  7]],
	[[ 6,  9], [ 8, 10]],
	[[ 1,  5], [ 3,  7]],
	[[ 2,  6], [ 4,  9]],
	[[ 8,  5], [10,  1]],
	[[ 3,  9], [ 7,  4]],
	[[ 2, 10], [ 6,  8]],
	[[ 1,  9], [ 5,  4]],
	[[ 3, 10], [ 7,  2]],
	[[ 6,  4], [ 8,  1]],
	[[ 5,  9], [ 2,  3]],
	[[ 7, 10], [ 6,  8]],
	[[ 1,  4], [ 2,  5]],
	[[ 9,  7], [ 6, 10]],
	[[ 3,  5], [ 8,  4]],
	[[ 1,  7], [ 2,  9]],
	[[ 6, 10], [ 3,  8]],
	[[ 4,  1], [ 7,  9]],
	[[ 5, 10], [ 3,  6]],
	[[ 2,  8], [ 1,  9]],
	[[ 4, 10], [ 7,  6]],
	[[ 3,  2], [ 5,  8]],
	[[ 1,  6], [ 4,  7]],
	[[ 9,  8], [ 3,  5]],
	[[10,  7], [ 2,  4]],
	[[ 1,  5], [ 6,  9]],
	[[ 3, 10], [ 8,  2]],
];

export const MatchLists: Match[][] = [
	matchList4,
	matchList5,
	matchList6,
	matchList7,
	matchList8,
	matchList9,
	matchList10,
];