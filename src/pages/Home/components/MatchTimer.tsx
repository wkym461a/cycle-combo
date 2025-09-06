import { CSSProperties, useEffect, useRef, useState } from "react";
import { useTimer } from "~/contexts/timer";

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typograpy from '@mui/material/Typography';
import Button from '@mui/material/Button';

import ConfirmModal from "~/components/ConfirmModal";
import MatchItem from "./MatchItem";
import { useMatches } from "~/contexts/matches";

type Props = {
	isDrawerOpened: boolean,
}

const CONTENT_WIDTH = 160;
const CONTENT_HEIGHT = 120;

function MatchTimer({ isDrawerOpened }: Props) {
	const { timer_s, isRunning, startTimer, stopTimer, resetTimer } = useTimer();
	const { matches, currentMatchIndex } = useMatches();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const min = Math.floor(timer_s / 60).toString().padStart(2, '0');
	const sec = Math.floor(timer_s % 60).toString().padStart(2, '0');

	const useScale = () => {
		const [scale, setScale] = useState(1);

		function handleResize() {
			const rect = ref.current?.getBoundingClientRect();
			let baseWidth = rect!.width;
			let baseHeight = rect!.height;

			const width = baseWidth ?? CONTENT_WIDTH;
			const height = baseHeight ?? CONTENT_HEIGHT;

			const scaleX = width / CONTENT_WIDTH;
			const scaleY = height / CONTENT_HEIGHT;

			const dynamicScale = Math.min(scaleX, scaleY);

			setScale(dynamicScale);
		}

		useEffect(() => {
			handleResize();

			window.addEventListener('resize', handleResize);

			const intervalID = window.setInterval(() => {console.log(`handleResize`); handleResize() }, 500);

			return () => {
				window.removeEventListener('resize', handleResize);

				window.clearInterval(intervalID);
			};
		}, []);

		return { scale }
	}
	const { scale } = useScale();

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

	function handleModalOpen() {
		setIsModalOpen(true);
	}
	function handleModalClose() {
		setIsModalOpen(false);
	}
	function handleConfirmResetTimer() {
		setIsModalOpen(false);
		resetTimer();
	}

	return (
		<Box
			ref={ref}
			width={(isDrawerOpened) ? 'calc(100% - 300px)' : '100%'}
			height='100%'
			sx={{ overflow: 'hidden' }}
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
					<Typograpy
						variant='h1'
						component='div'
						fontSize={64 * scale}
						color={(isRunning) ? 'textPrimary' : 'primary'}
					>
						{`${min}:${sec}`}
					</Typograpy>

					{(matches.length > 0) &&
						<MatchItem match={matches[currentMatchIndex]} isContained={true} scale={scale * 0.625} />
					}

					{/* 再生・一時停止・キャンセルのボタン類 */}
					<Box pt={2} sx={{ width: `${contentWidth}px` }} >
						<Stack direction='row' spacing={1} p={1}
							sx={{
								height: '100%',
								alignItems: 'center',
								justifyContent: 'space-evenly',
							}}
						>
							{(isRunning) ?
							<Button variant="outlined" sx={{ width: `45%` }} onClick={stopTimer}>
								一時停止
							</Button>
							:
							<Button variant="outlined" sx={{ width: `45%` }} onClick={startTimer}>
								再開
							</Button>
							}
							<Button variant="outlined" sx={{ width: `45%` }} onClick={handleModalOpen}>
								リセット
							</Button>
						</Stack>
					</Box>
				</Stack>
			</Box>

			<ConfirmModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onConfirm={handleConfirmResetTimer}
				title='タイマをリセットします'
				description='現在の試合は維持されます'
			/>
		</Box>
	);

}

export default MatchTimer;
