import { CSSProperties, useRef } from "react";

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import MatchItem from "./MatchItem";
import { useTimerActions, useTimerState } from "~/contexts/timer";
import { useMatchesState } from "~/contexts/matches";
import { useConfirm } from "~/hooks/useConfirm";
import { useFitScale } from "~/hooks/useFitScale";

type Props = {
	/** 右側に常時表示されるドロワーの幅（px、セーフエリア分を除く。表示されていなければ 0） */
	reservedRightWidth: number,
}

const CONTENT_WIDTH = 160;
const CONTENT_HEIGHT = 120;

function MatchTimer({ reservedRightWidth }: Props) {
	const { remainingSec, isRunning } = useTimerState();
	const { startTimer, pauseTimer, resetTimer } = useTimerActions();
	const { matches, currentMatchIndex } = useMatchesState();
	const { confirm, confirmDialog } = useConfirm();
	const ref = useRef<HTMLDivElement>(null);
	const scale = useFitScale(ref, CONTENT_WIDTH, CONTENT_HEIGHT);

	const min = Math.floor(remainingSec / 60).toString().padStart(2, '0');
	const sec = Math.floor(remainingSec % 60).toString().padStart(2, '0');

	const contentWidth = CONTENT_WIDTH * scale;
	const contentHeight = CONTENT_HEIGHT * scale;
	const scaleStyle: CSSProperties = {
		top: '50%',
		left: '50%',
		transform: `translate(-50%, -50%)`,
		transformOrigin: 'top left',
		width: `${contentWidth}px`,
		height: `${contentHeight}px`,
	}

	async function handleReset() {
		if (await confirm({ title: 'タイマをリセットします', description: '現在の試合は維持されます' })) {
			resetTimer();
		}
	}

	return (
		<Box
			ref={ref}
			// ドロワーは右セーフエリア分だけ広く描かれる（MatchListDrawer）ので、その分も差し引く
			width={(reservedRightWidth > 0) ? `calc(100% - ${reservedRightWidth}px - env(safe-area-inset-right))` : '100%'}
			height='100%'
			sx={{
				overflow: 'hidden',
				// ノッチ・ホームインジケータと重ならないよう、セーフエリア分を内側に取る
				pb: 'env(safe-area-inset-bottom)',
				pl: 'env(safe-area-inset-left)',
				pr: (reservedRightWidth > 0) ? 0 : 'env(safe-area-inset-right)',
				boxSizing: 'border-box',
			}}
		>
			<Box
				sx={{
					...scaleStyle,
					position: 'relative',
					display: 'inline-flex',
				}}
			>
				<Stack
					spacing={2}
					pb={2}
					sx={{
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						position: 'absolute',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					{/* タイマー */}
					<Typography
						variant='h1'
						component='div'
						fontSize={64 * scale}
						color={(isRunning) ? 'textPrimary' : 'primary'}
					>
						{`${min}:${sec}`}
					</Typography>

					{(matches.length > 0) &&
						<MatchItem match={matches[currentMatchIndex]} isContained={true} scale={scale * 0.625} />
					}

					{/* 再生・一時停止・リセットのボタン類 */}
					<Box pt={2} sx={{ width: `${contentWidth}px` }} >
						<Stack direction='row' spacing={1} p={1}
							sx={{
								height: '100%',
								alignItems: 'center',
								justifyContent: 'space-evenly',
							}}
						>
							{(isRunning) ?
							<Button variant="outlined" sx={{ width: `45%` }} onClick={pauseTimer}>
								一時停止
							</Button>
							:
							<Button variant="outlined" sx={{ width: `45%` }} onClick={startTimer}>
								再開
							</Button>
							}
							<Button variant="outlined" sx={{ width: `45%` }} onClick={handleReset}>
								リセット
							</Button>
						</Stack>
					</Box>
				</Stack>
			</Box>

			{confirmDialog}
		</Box>
	);
}

export default MatchTimer;
