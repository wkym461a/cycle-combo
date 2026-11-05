#!/usr/bin/env python3
"""ダブルスの試合組み合わせ表（src/contexts/matches/consts.tsx）を生成する。

使い方:
    python3 scripts/generate-matches.py            # 4〜20人分を生成して consts.tsx を書き出す
    python3 scripts/generate-matches.py --only 7   # 7人分だけ生成して標準出力に表示（ファイルは書かない）
    python3 scripts/generate-matches.py --check    # 生成結果が consts.tsx と一致するか確認（CI向け）

乱数を使わない決定的なアルゴリズムなので、同じ入力からは常に同じ表が生成される。
依存は Python 3.10+ の標準ライブラリのみ。

## 表の定義

- 1試合は「左側ペア vs 右側ペア」。表は循環リストとして扱う（末尾の次は先頭）。
- 1周の長さ L は「全ペア（N人から2人を選ぶ組）がちょうど k 回ずつ出る」ように決める。
  ペア総数が奇数のときは k=2、偶数なら k=1。各ペアが均等なら各人の出場数も自動的に均等になる。
- 左右反転した同じ試合（12-34 と 34-12）は表には持たない。アプリ側が1周ごとに左右を反転して
  2周目を回す（src/contexts/matches/index.tsx）。

## 評価（小さいほど良い）

循環リスト上で、次の5種類それぞれについて「同じものが再び出るまでの間隔 d」を全て集め、
(期待間隔 / d)^2 に重みを掛けて合計する。近いほど二乗で重く効くので、連続が最も強く罰せられ、
凸関数なので間隔が均等になる方向に寄る。
  1. 同じ人の出場（重み 20、期待間隔 N/4）
  2. 同じペア（重み 2、期待間隔 L/k）
  3. 同じペアがコートの同じ側（重み 1、期待間隔 2L/k）
  4. 同じ対戦相手の2人（重み 0.3、期待間隔 ペア総数/4）
  5. 同じ4人の組（重み 2、期待間隔 min(L, 4人組の総数)）
さらに隣り合う試合で重なってよい人数の上限 maxov（4人:4, 5人:3, 6人:2, 7人:1, 8人:1, 9人以上:0）を
ハード制約にする。9人以上は「連続出場なし」、8人は混合を許す最小値（0 にすると固定2組の交互になる）。
末尾→先頭の継ぎ目はハード制約にせず、評価の循環距離項で「できる限り」扱いにする。

## 探索

1. ビームサーチ。各ステップで全候補（4人の選び方 × ペア分け3通り × 左右2通り）に、
   その時点の履歴から上記評価の増分を付け、累積評価の小さい順に上位 B 本を残す。
   同点のときは試合の番号列の辞書順（若い番号優先）で決める。
   - 各選手の未使用ペア数が残り試合数を超える候補は除外（必要条件）。残り6試合以下では
     実際に完走できるかを探索して確認する。
   - 末尾3試合は全列挙し、真の循環評価で最良の列を選ぶ（同点は辞書順）。
   - 完走できなければ B を4倍にして再試行し、上限を超えたら深さ優先探索（同じ順序規則）に切り替える。
2. 山登り。固定順で「左右入替」「2試合の入替」「2試合間のペア交換」を試し、評価が下がる場合だけ
   採用する。改善がなくなるまで繰り返す。
3. 循環リストなので、番号が最も若い試合（通常 12-34）が先頭になるよう回転する。
"""
from __future__ import annotations

import argparse
import itertools
import os
import sys
import time
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

MIN_PEOPLE = 4
MAX_PEOPLE = 20
OUT_PATH = Path(__file__).resolve().parent.parent / 'src' / 'contexts' / 'matches' / 'consts.tsx'

CATS = ('player', 'pair', 'side', 'opp', 'quad')
WEIGHT = dict(player=20.0, pair=2.0, side=1.0, opp=0.3, quad=2.0)
MAXOV = {4: 4, 5: 3, 6: 2, 7: 1, 8: 1}
TAIL = 3           # 末尾で全列挙する試合数
LOOKAHEAD = 4      # 残り試合数がこれ以下なら完走可能性を実探索で確認（結果はメモ化）
EPS = 1e-9

Pair = tuple[int, int]
Match = tuple[Pair, Pair]


def params(n: int) -> tuple[int, int, int]:
    """(1周の試合数 L, 各ペアの登場回数 k, 隣接試合の重なり上限 maxov)"""
    c2 = n * (n - 1) // 2
    k = 2 if c2 % 2 == 1 else 1
    return k * c2 // 2, k, MAXOV.get(n, 0)


def expected(n: int, L: int, k: int) -> dict[str, float]:
    c2 = n * (n - 1) // 2
    c4 = n * (n - 1) * (n - 2) * (n - 3) // 24
    return dict(player=n / 4, pair=L / k, side=2 * L / k, opp=c2 / 4, quad=min(L, c4))


def candidates(n: int) -> list[Match]:
    """全候補を (a,b,c,d) の辞書順で。a<b, c<d, 4人は相異なる。左右の入れ替えも別候補。"""
    out: list[Match] = []
    for a, b, c, d in itertools.product(range(1, n + 1), repeat=4):
        if a < b and c < d and len({a, b, c, d}) == 4:
            out.append(((a, b), (c, d)))
    return out


def keys_of(m: Match) -> dict[str, list]:
    (a, b), (c, d) = m
    return dict(
        player=[a, b, c, d],
        pair=[(a, b), (c, d)],
        side=[((a, b), 0), ((c, d), 1)],
        opp=[tuple(sorted(x)) for x in ((a, c), (a, d), (b, c), (b, d))],
        quad=[tuple(sorted((a, b, c, d)))],
    )


def gaps(positions: list[int], L: int) -> list[int]:
    if len(positions) == 1:
        return [L]
    return [((positions[(j + 1) % len(positions)] - positions[j]) % L) or L for j in range(len(positions))]


def occurrences(seq: list[Match]) -> dict[str, dict]:
    pos: dict[str, dict] = {c: defaultdict(list) for c in CATS}
    for i, m in enumerate(seq):
        for cat, keys in keys_of(m).items():
            for key in keys:
                pos[cat][key].append(i)
    return pos


def cost(seq: list[Match], n: int, L: int, k: int) -> float:
    """循環リスト全体の評価値"""
    e = expected(n, L, k)
    pos = occurrences(seq)
    total = 0.0
    for cat in CATS:
        s = 0.0
        for ps in pos[cat].values():
            for d in gaps(ps, L):
                s += (e[cat] / d) ** 2
        total += WEIGHT[cat] * s
    return total


def metrics(seq: list[Match], n: int) -> dict:
    L = len(seq)
    pos = occurrences(seq)

    def hist(cat: str) -> dict[int, int]:
        h: dict[int, int] = defaultdict(int)
        for ps in pos[cat].values():
            for d in gaps(ps, L):
                h[d] += 1
        return dict(sorted(h.items()))

    pair_counts = sorted(len(v) for v in pos['pair'].values())
    games = sorted(len(v) for v in pos['player'].values())
    return dict(
        L=L,
        games=(games[0], games[-1]),
        pair_count=(pair_counts[0], pair_counts[-1], n * (n - 1) // 2 - len(pair_counts)),
        player_gap=hist('player'),
        pair_gap_min=min(hist('pair')),
        side_gap_min=min(hist('side')),
        opp_gap_min=min(hist('opp')),
        quad_gap_min=min(hist('quad')),
        quad_distinct=len(pos['quad']),
    )


class Search:
    def __init__(self, n: int):
        self.n = n
        self.L, self.k, self.maxov = params(n)
        self.E = expected(n, self.L, self.k)
        self.cands = candidates(n)
        self.keys = [keys_of(m) for m in self.cands]
        self.psets = [frozenset(m[0] + m[1]) for m in self.cands]
        self.memo: dict[tuple, bool] = {}

    # --- 共通の制約 ---------------------------------------------------------
    def usable(self, idx: int, used: dict, prev: frozenset | None) -> bool:
        K = self.keys[idx]
        if used.get(K['pair'][0], 0) >= self.k or used.get(K['pair'][1], 0) >= self.k:
            return False
        return prev is None or len(self.psets[idx] & prev) <= self.maxov

    def add_used(self, used: dict, idx: int) -> dict:
        used2 = dict(used)
        for p in self.keys[idx]['pair']:
            used2[p] = used2.get(p, 0) + 1
        return used2

    def feasible(self, used: dict, prev: frozenset, r: int) -> bool:
        """残り r 試合を制約どおり置けるか（1つ見つかれば真）。未使用ペアの集合と直前の4人でメモ化。"""
        if r == 0:
            return True
        key = (tuple(sorted(used.items())), prev)
        hit = self.memo.get(key)
        if hit is not None:
            return hit
        # 未使用ペアを含む候補だけ走査する
        result = False
        for idx in range(len(self.cands)):
            if self.usable(idx, used, prev) and self.feasible(self.add_used(used, idx), self.psets[idx], r - 1):
                result = True
                break
        self.memo[key] = result
        return result

    def remaining_per_player(self, used: dict) -> list[int]:
        n, k = self.n, self.k
        rem = [0] * (n + 1)
        for a in range(1, n + 1):
            for b in range(a + 1, n + 1):
                left = k - used.get((a, b), 0)
                rem[a] += left
                rem[b] += left
        return rem

    def step_score(self, idx: int, i: int, hist: dict) -> float:
        """位置 i に候補 idx を置いたときの評価の増分（直前の出現と、循環で先頭側の初出現との距離）"""
        s = 0.0
        L = self.L
        for cat in CATS:
            w = WEIGHT[cat]
            e = self.E[cat]
            h = hist[cat]
            for key in self.keys[idx][cat]:
                fl = h.get(key)
                if fl:
                    s += w * ((e / (i - fl[1])) ** 2 + (e / (L - i + fl[0])) ** 2)
        return s

    # --- ビームサーチ ---------------------------------------------------------
    def beam(self, B: int) -> list[Match] | None:
        L = self.L
        T = min(TAIL, L)
        beam = [(0.0, (), {}, {c: {} for c in CATS})]   # (累積評価, 列, used, 履歴 cat->key->(初出, 直前))
        for i in range(L - T):
            r = L - i - 1   # この試合を置いた後に残る試合数
            nxt = []
            for cum, seq, used, hist in beam:
                prev = self.psets[seq[-1]] if seq else None
                rem = self.remaining_per_player(used)
                if any(x > r + 1 for x in rem):
                    continue
                must = frozenset(p for p in range(1, self.n + 1) if rem[p] == r + 1)
                for idx in range(len(self.cands)):
                    if not self.usable(idx, used, prev):
                        continue
                    if must and not must <= self.psets[idx]:
                        continue
                    if r <= LOOKAHEAD and not self.feasible(self.add_used(used, idx), self.psets[idx], r):
                        continue
                    nxt.append((cum + self.step_score(idx, i, hist), seq + (idx,), idx, used, hist))
            if not nxt:
                return None
            nxt.sort(key=lambda t: (t[0], t[1]))   # 評価、同点なら番号列の辞書順
            beam = []
            for cum, seq, idx, used, hist in nxt[:B]:
                hist2 = {}
                for cat in CATS:
                    h = dict(hist[cat])
                    for key in self.keys[idx][cat]:
                        fl = h.get(key)
                        h[key] = (fl[0] if fl else i, i)
                    hist2[cat] = h
                beam.append((cum, seq, self.add_used(used, idx), hist2))
        # 末尾 T 試合は全列挙し、真の循環評価で選ぶ
        finals: list[tuple[float, tuple, list[Match]]] = []

        def complete(seq: tuple, used: dict) -> None:
            if len(seq) == L:
                s = [self.cands[t] for t in seq]
                finals.append((cost(s, self.n, L, self.k), seq, s))
                return
            prev = self.psets[seq[-1]] if seq else None
            for idx in range(len(self.cands)):
                if self.usable(idx, used, prev):
                    complete(seq + (idx,), self.add_used(used, idx))

        for _, seq, used, _ in beam:
            complete(seq, used)
        if not finals:
            return None
        finals.sort(key=lambda t: (t[0], t[1]))
        return finals[0][2]

    # --- 深さ優先探索（ビームが完走できないときの保険） ------------------------------
    def dfs(self, limit: int = 3_000_000) -> list[Match] | None:
        L = self.L
        hist: dict[str, dict] = {c: defaultdict(list) for c in CATS}
        used: dict = {}
        seq: list[int] = []
        nodes = 0

        def score(idx: int, i: int) -> float:
            s = 0.0
            for cat in CATS:
                w = WEIGHT[cat]
                e = self.E[cat]
                h = hist[cat]
                for key in self.keys[idx][cat]:
                    ps = h.get(key)
                    if ps:
                        s += w * ((e / (i - ps[-1])) ** 2 + (e / (L - i + ps[0])) ** 2)
            return s

        def rec() -> bool:
            nonlocal nodes, used
            nodes += 1
            if nodes > limit:
                return False
            i = len(seq)
            if i == L:
                return True
            prev = self.psets[seq[-1]] if seq else None
            opts = sorted((score(idx, i), idx) for idx in range(len(self.cands)) if self.usable(idx, used, prev))
            for _, idx in opts:
                seq.append(idx)
                for cat in CATS:
                    for key in self.keys[idx][cat]:
                        hist[cat][key].append(i)
                saved = used
                used = self.add_used(used, idx)
                if rec():
                    return True
                used = saved
                for cat in CATS:
                    for key in self.keys[idx][cat]:
                        hist[cat][key].pop()
                seq.pop()
            return False

        sys.setrecursionlimit(10000)
        return [self.cands[t] for t in seq] if rec() else None

    # --- 山登り ---------------------------------------------------------------
    def polish(self, seq: list[Match]) -> tuple[list[Match], float, int]:
        n, L, k, maxov = self.n, self.L, self.k, self.maxov

        def ov(i: int, j: int) -> int:
            return len(set(seq[i % L][0] + seq[i % L][1]) & set(seq[j % L][0] + seq[j % L][1]))

        def ok_around(*idxs: int) -> bool:
            return all((t == 0 or ov(t - 1, t) <= maxov) and (t == L - 1 or ov(t, t + 1) <= maxov) for t in idxs)

        cur = cost(seq, n, L, k)
        passes = 0
        while True:
            passes += 1
            improved = False
            for i in range(L):                                   # 左右入替
                seq[i] = (seq[i][1], seq[i][0])
                c = cost(seq, n, L, k)
                if c < cur - EPS:
                    cur, improved = c, True
                else:
                    seq[i] = (seq[i][1], seq[i][0])
            for i in range(L):                                   # 2試合の入替
                for j in range(i + 1, L):
                    seq[i], seq[j] = seq[j], seq[i]
                    if ok_around(i, j):
                        c = cost(seq, n, L, k)
                        if c < cur - EPS:
                            cur, improved = c, True
                            continue
                    seq[i], seq[j] = seq[j], seq[i]
            for i in range(L):                                   # 2試合間のペア交換
                for j in range(i + 1, L):
                    for si in (0, 1):
                        for sj in (0, 1):
                            mi, mj = list(seq[i]), list(seq[j])
                            pi, pj = mi[si], mj[sj]
                            if set(pi) & set(mj[1 - sj]) or set(pj) & set(mi[1 - si]):
                                continue
                            mi[si], mj[sj] = pj, pi
                            old_i, old_j = seq[i], seq[j]
                            seq[i], seq[j] = (mi[0], mi[1]), (mj[0], mj[1])
                            if ok_around(i, j):
                                c = cost(seq, n, L, k)
                                if c < cur - EPS:
                                    cur, improved = c, True
                                    continue
                            seq[i], seq[j] = old_i, old_j
            if not improved:
                return seq, cur, passes


def default_beam(n: int) -> int:
    return 1000 if n <= 10 else 100


def generate(n: int, log=print) -> list[Match]:
    s = Search(n)
    t0 = time.time()
    B = default_beam(n)
    seq = None
    while B <= 16 * default_beam(n):
        seq = s.beam(B)
        if seq is not None:
            log(f'  beam B={B}: {time.time() - t0:.1f}s')
            break
        log(f'  beam B={B}: 完走できず')
        B *= 4
    if seq is None:
        seq = s.dfs()
        log(f'  dfs: {time.time() - t0:.1f}s')
        if seq is None:
            raise RuntimeError(f'N={n}: 表を生成できませんでした')
    seq, _, passes = s.polish(seq)
    log(f'  polish: {passes} passes, {time.time() - t0:.1f}s total')
    # 循環リストなので開始位置は自由。番号が最も若い試合（通常は 12-34）から始まるように回転する
    start = min(range(len(seq)), key=lambda i: seq[i])
    return seq[start:] + seq[:start]


# --- 出力 -----------------------------------------------------------------------------
def fmt_match(m: Match, width: int) -> str:
    (a, b), (c, d) = m
    f = lambda x: str(x).rjust(width)  # noqa: E731
    return f'[[{f(a)}, {f(b)}], [{f(c)}, {f(d)}]]'


def render(tables: dict[int, list[Match]]) -> str:
    lines = [
        '// このファイルは scripts/generate-matches.py により生成される。手で編集しないこと。',
        '// 再生成: python3 scripts/generate-matches.py',
        '',
        'export type Pair = [number, number];',
        'export type Match = [Pair, Pair];',
        '',
    ]
    for n, seq in tables.items():
        L, k, maxov = params(n)
        m = metrics(seq, n)
        lines.append(f'// {n}人: {L}試合で1周（各ペア{k}回、隣接試合の重なり{maxov}人以下）。'
                     f' 同じ人の出場間隔 {m["player_gap"]}, 同じペアの最小間隔 {m["pair_gap_min"]},'
                     f' 同じペア同側の最小間隔 {m["side_gap_min"]}, 同じ4人組の最小間隔 {m["quad_gap_min"]}')
        lines.append(f'const matchList{n}: Match[] = [')
        width = 2 if n >= 10 else 1
        for mt in seq:
            lines.append(f'\t{fmt_match(mt, width)},')
        lines.append('];')
        lines.append('')
    lines.append('export const MatchLists: Match[][] = [')
    for n in tables:
        lines.append(f'\tmatchList{n},')
    lines.append('];')
    lines.append('')
    lines.append(f'export const MIN_PEOPLE_NUM = {MIN_PEOPLE};')
    lines.append('export const PEOPLE_NUM_OPTIONS: number[] = MatchLists.map((_, i) => i + MIN_PEOPLE_NUM);')
    lines.append('')
    lines.append('// 人数に対応する組み合わせ表。範囲外なら空配列。')
    lines.append('export function getMatchList(peopleNum: number): Match[] {')
    lines.append('\treturn MatchLists[peopleNum - MIN_PEOPLE_NUM] ?? [];')
    lines.append('}')
    return '\n'.join(lines) + '\n'


def compact(seq: list[Match]) -> str:
    sep = ',' if max(max(m[0] + m[1]) for m in seq) >= 10 else ''
    return ' '.join(f'{a}{sep}{b}-{c}{sep}{d}' for (a, b), (c, d) in seq)


def _generate_one(n: int) -> list[Match]:
    lines: list[str] = []
    seq = generate(n, log=lines.append)
    m = metrics(seq, n)
    assert m['pair_count'][2] == 0 and m['pair_count'][0] == m['pair_count'][1], m
    assert m['games'][0] == m['games'][1], m
    lines.append(f'  L={m["L"]} player_gap={m["player_gap"]} pair_min={m["pair_gap_min"]} '
                 f'side_min={m["side_gap_min"]} opp_min={m["opp_gap_min"]} quad_min={m["quad_gap_min"]} '
                 f'quad_distinct={m["quad_distinct"]}')
    print(f'N={n}\n' + '\n'.join(lines), file=sys.stderr, flush=True)
    return seq


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', type=int, help='この人数だけ生成して表示する（ファイルは書かない）')
    ap.add_argument('--check', action='store_true', help='生成結果が consts.tsx と一致するか確認する')
    args = ap.parse_args()

    ns = [args.only] if args.only else list(range(MIN_PEOPLE, MAX_PEOPLE + 1))
    # 人数ごとに独立なので並列に生成する（結果は人数ごとに決定的）
    with ProcessPoolExecutor(max_workers=min(len(ns), os.cpu_count() or 1)) as ex:
        results = list(ex.map(_generate_one, ns))
    tables: dict[int, list[Match]] = dict(zip(ns, results))

    if args.only:
        print(compact(tables[args.only]))
        return 0
    text = render(tables)
    if args.check:
        if OUT_PATH.read_text() == text:
            print('OK: consts.tsx は生成結果と一致しています')
            return 0
        print('NG: consts.tsx が生成結果と異なります。python3 scripts/generate-matches.py を実行してください')
        return 1
    OUT_PATH.write_text(text)
    print(f'wrote {OUT_PATH}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
