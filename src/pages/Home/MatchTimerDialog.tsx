import { useEffect, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import ConfirmModal from "~/components/ConfirmModal";
import MatchTimer from './components/MatchTimer';
import MatchListDrawer from './components/MatchListDrawer';

import { useTimer, setTimeoverAction } from '~/contexts/timer';
import { useMatches } from '~/contexts/matches';
import { useAudio } from '~/contexts/audio';

const drawerWidth = 300;

type Props = {
	isOpen: boolean,
	onClose: () => void,
}

function MatchTimerDialog({ isOpen, onClose }: Props) {
	const [isOpenMatchListDrawer, setIsOpenMatchListDrawer] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLandscape, setIsLandscape] = useState(false);

	const { resetTimer } = useTimer();
	const { matches, currentMatchIndex, nextMatch, jumpMatch } = useMatches();

	const { play } = useAudio();

	function handleClose() {
		setIsOpenMatchListDrawer(false);
		onClose();
	}

	function handleCloseMatchListDrawer() {
		setIsOpenMatchListDrawer(false);
	}
	function handleToggleMatchListDrawer() {
		setIsOpenMatchListDrawer(pre => !pre);
	}

	function handleModalOpen() {
		setIsModalOpen(true);
	}
	function handleModalClose() {
		setIsModalOpen(false);
	}
	function handleConfirmClose() {
		setIsModalOpen(false);
		handleClose();
	}

	useEffect(() => {
		setTimeoverAction(() => {
			if (0 <= currentMatchIndex && currentMatchIndex < matches.length - 1) {
				nextMatch();
			} else {
				jumpMatch(0);
			}

			resetTimer();

			play();
		});
	}, [matches, currentMatchIndex]);

	function updateOrientation() {
		switch (window.screen.orientation.type) {
		case "portrait-primary":
		case "portrait-secondary":
			setIsLandscape(false);
			setIsOpenMatchListDrawer(false);
			break;

		case 'landscape-primary':
		case 'landscape-secondary':
			setIsLandscape(true);
			setIsOpenMatchListDrawer(true);
			break;
		}
	}
	useEffect(() => {
		updateOrientation();
		window.addEventListener("orientationchange", updateOrientation);

		return () => {
			window.removeEventListener("orientationchange", updateOrientation);
		};
	}, []);

	return (
		<Dialog
			fullScreen
			open={isOpen}
			onClose={handleClose}
		>
			<AppBar position="static" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						onClick={handleModalOpen}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Timer{(matches.length > 0) && ' & Match'}
					</Typography>

					{(matches.length > 0) && !isLandscape &&
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						onClick={handleToggleMatchListDrawer}
						aria-label="close"
					>
						{(isOpenMatchListDrawer) ?
						<MenuOpenIcon sx={{ transform: 'rotate(180deg)' }} />
						:
						<MenuIcon />
						}
					</IconButton>
					}
				</Toolbar>
			</AppBar>

			<MatchTimer isDrawerOpened={(matches.length > 0) && isLandscape} />

			<MatchListDrawer
				width={drawerWidth}
				isOpen={(isOpenMatchListDrawer || isLandscape) && (matches.length > 0)}
				onClose={handleCloseMatchListDrawer}
			/>

			<ConfirmModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onConfirm={handleConfirmClose}
				title='タイマを終了します'
			/>
		</Dialog>
	)
}

export default MatchTimerDialog;
