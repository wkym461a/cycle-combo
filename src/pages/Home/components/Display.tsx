import { CSSProperties, useEffect, useRef, useState } from "react";
import { useTimer } from "~/contexts/timer";

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from "@mui/material/CircularProgress";
import Typograpy from '@mui/material/Typography';
import Button from '@mui/material/Button';

import MatchItem from "./MatchItem";
import { useMatches } from "~/contexts/matches";
import Progress from "~/components/Progress";

const CONTENT_WIDTH = 120;
const CONTENT_HEIGHT = 120;

const PORTRAIT_CTRL_HEIGHT = 60;
const LANDSCAPE_CTRL_WIDTH = 144;

let isLandscape = true;

function Display() {
	const { initTimer_s, timer_s, isRunning, startTimer, stopTimer, resetTimer } = useTimer();
	const { matches, currentMatchIndex } = useMatches();
	const ref = useRef<HTMLDivElement>(null);

	const min = Math.floor(timer_s / 60).toString().padStart(2, '0');
	const sec = Math.floor(timer_s % 60).toString().padStart(2, '0');

	const useScale = () => {
		const [scale, setScale] = useState(1);

		function handleResize() {
			const rect = ref.current?.getBoundingClientRect();
			let baseWidth = rect!.width;
			let baseHeight = rect!.height;
			isLandscape = (baseWidth >= baseHeight);

			if (isLandscape) {
				baseWidth -= LANDSCAPE_CTRL_WIDTH;
			} else {
				baseHeight -= PORTRAIT_CTRL_HEIGHT;
			}

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
	const widthOffset = (isLandscape) ? LANDSCAPE_CTRL_WIDTH : 0;
	const heightOffset = (isLandscape) ? 0 : PORTRAIT_CTRL_HEIGHT;
	const scaleStyle: CSSProperties = {
		top: '50%',
		left: '50%',
		transform: `translate(-50%, -50%)`,
		transformOrigin: 'top left',
		width: `${contentWidth + widthOffset}px`,
		height: `${contentHeight + heightOffset}px`,
	}

	return (
		<Box
			ref={ref}
			height='100%'
			sx={{ overflow: 'hidden' }}
		>
			<Box sx={{ ...scaleStyle, position: 'relative' }}>
				<Stack direction={(isLandscape) ? 'row' : 'column'}>
					{/* 円形のタイマー */}
					<Box
						sx={{
							width: `${(isLandscape) ? contentHeight : contentWidth}px`,
							height: `${(isLandscape) ? contentHeight : contentWidth}px`,
							position: 'relative',
							display: 'inline-flex',
							// bgcolor: 'green',
						}}
					>
						{/* 円形タイマーのProgressBarの跡 */}
						<CircularProgress
							sx={{
								m: '5%',
								top: 0,
								left: 0,
								bottom: 0,
								right: 0,
								position: 'absolute',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								opacity: 0.1,
								'& .MuiCircularProgress-svg': {
									width: '100%',
									height: '100%',
								},
							}}
							variant='determinate'
							value={100}
							size='90%'
							thickness={0.4}
						/>

						{/* 円形タイマーのProgressBar */}
						<CircularProgress
							sx={{
								m: '5%',
								top: 0,
								left: 0,
								bottom: 0,
								right: 0,
								position: 'absolute',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								'& .MuiCircularProgress-svg': {
									width: '100%',
									height: '100%',
								},
							}}
							variant='determinate'
							value={ timer_s * -100 / initTimer_s }
							size='90%'
							thickness={0.4}
						/>
						{/* <Progress
							value={ timer_s * -100 / initTimer_s }
							style={{
								top: 0,
								left: 0,
								bottom: 0,
								right: 0,
								width: '100%',
								height: '100%',
								position: 'absolute',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						/> */}

						<Stack
							spacing={4}
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
							<Typograpy
								variant='h1'
								component='div'
								fontSize={28 * scale}
								color={(isRunning) ? 'textPrimary' : 'primary'}
							>
								{`${min}:${sec}`}
							</Typograpy>

							{(matches.length > 0) &&
								<MatchItem match={matches[currentMatchIndex]} isContained={true} scale={scale / 3} />
							}
						</Stack>
					</Box>
					{/* 再生・一時停止・キャンセルのボタン類 */}
					{(isLandscape) ?
					// 横画面時
					<Box
						sx={{
							width: `${LANDSCAPE_CTRL_WIDTH}px`,
							height: `${contentHeight}px`,
						}}
					>
						<Stack
							direction='column'
							spacing={8}
							p={2}
							sx={{
								height: '100%',
								alignItems: 'stretch',
								justifyContent: 'center',
							}}
						>
							{(isRunning) ?
							<Button
								variant="outlined"
								onClick={stopTimer}
							>
								一時停止
							</Button>
							:
							<Button
								variant="outlined"
								onClick={startTimer}
							>
								再開
							</Button>
							}
							<Button
								variant="outlined"
								onClick={resetTimer}
							>
								リセット
							</Button>
						</Stack>
					</Box>
					:
					// 縦画面時
					<Box
						sx={{
							width: `${contentWidth}px`,
							height: `${PORTRAIT_CTRL_HEIGHT}px`,
						}}
					>
						<Stack
							direction='row'
							spacing={2}
							p={1}
							sx={{
								height: '100%',
								alignItems: 'center',
								justifyContent: 'space-evenly',
							}}
						>
							{(isRunning) ?
							<Button
								variant="outlined"
								sx={{ width: `33%` }}
								onClick={stopTimer}
							>
								一時停止
							</Button>
							:
							<Button
								variant="outlined"
								sx={{ width: `33%` }}
								onClick={startTimer}
							>
								再開
							</Button>
							}
							<Button
								variant="outlined"
								sx={{ width: `33%` }}
								onClick={resetTimer}
							>
								リセット
							</Button>
						</Stack>
					</Box>
					}
				</Stack>

			</Box>
		</Box>
	);

}

export default Display;
