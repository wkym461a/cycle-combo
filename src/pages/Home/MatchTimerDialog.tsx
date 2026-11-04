import { useEffect, useRef, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import MatchTimer from './components/MatchTimer';
import MatchListDrawer from './components/MatchListDrawer';

import { useTimerState } from '~/contexts/timer';
import { useMatchesActions, useMatchesState } from '~/contexts/matches';
import { useAudioActions, useAudioState } from '~/contexts/audio';
import { useWakeLock } from '~/contexts/wakeLock';
import { useConfirm } from '~/hooks/useConfirm';
import { useIsLandscape } from '~/hooks/useIsLandscape';

const DRAWER_WIDTH = 300;

type Props = {
	isOpen: boolean,
	onClose: () => void,
}

function MatchTimerDialog({ isOpen, onClose }: Props) {
	const [isDrawerToggledOpen, setIsDrawerToggledOpen] = useState(false);
	const isLandscape = useIsLandscape();

	const { laps } = useTimerState();
	const { matches } = useMatchesState();
	const { advanceMatch } = useMatchesActions();
	const { isReady, isUnlocked } = useAudioState();
	const { play, activateSession } = useAudioActions();
	const { enableWakeLock } = useWakeLock();
	const { confirm, confirmDialog } = useConfirm();

	const hasMatches = matches.length > 0;
	// 横向きなら一覧を常時表示、縦向きならボタンで開閉
	const isDrawerShown = hasMatches && (isLandscape || isDrawerToggledOpen);

	// タイマーが1周するたびに次の試合組へ進めて音を鳴らす。
	// バックグラウンド中に複数周経過していた場合はその分まとめて進め、音は1回だけ鳴らす。
	const lapsRef = useRef(laps);
	useEffect(() => {
		const passed = laps - lapsRef.current;
		lapsRef.current = laps;
		if (passed <= 0) return;
		advanceMatch(passed);
		play();
	}, [laps, advanceMatch, play]);

	async function handleClose() {
		if (await confirm({ title: 'タイマを終了します' })) {
			setIsDrawerToggledOpen(false);
			onClose();
		}
	}

	// リロード後や音声の中断後など、ユーザー操作なしでは音が鳴らせない状態からの復帰
	function handleUnlock() {
		void activateSession();
		enableWakeLock();
	}

	return (
		<Dialog
			fullScreen
			open={isOpen}
			onClose={handleClose}
		>
			<AppBar
				position="static"
				sx={{
					zIndex: (theme) => theme.zIndex.drawer + 1,
					pt: 'env(safe-area-inset-top)',
					pl: 'env(safe-area-inset-left)',
					pr: 'env(safe-area-inset-right)',
				}}
			>
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						onClick={handleClose}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Timer{hasMatches && ' & Match'}
					</Typography>

					{hasMatches && !isLandscape &&
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						onClick={() => setIsDrawerToggledOpen(prev => !prev)}
						aria-label="toggle match list"
					>
						{(isDrawerToggledOpen) ?
						<MenuOpenIcon sx={{ transform: 'rotate(180deg)' }} />
						:
						<MenuIcon />
						}
					</IconButton>
					}
				</Toolbar>
			</AppBar>

			{isReady && !isUnlocked &&
			<Alert
				severity="warning"
				sx={{ borderRadius: 0 }}
				action={
					<Button color="inherit" size="small" onClick={handleUnlock}>
						有効化
					</Button>
				}
			>
				音が鳴らない状態です。タップして音声を有効化してください。
			</Alert>
			}

			<MatchTimer reservedRightWidth={(hasMatches && isLandscape) ? DRAWER_WIDTH : 0} />

			<MatchListDrawer
				width={DRAWER_WIDTH}
				isOpen={isDrawerShown}
				onClose={() => setIsDrawerToggledOpen(false)}
			/>

			{confirmDialog}
		</Dialog>
	)
}

export default MatchTimerDialog;
