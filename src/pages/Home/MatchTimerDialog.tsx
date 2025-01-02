import { useEffect, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import Stack from '@mui/material/Stack';

import useSound from 'use-sound';
import sound from '~/assets/timer.mp3';

import Display from './components/Display';
import MatchItem from "./components/MatchItem";

import { useTimer, setTimeoverAction } from '~/contexts/timer';
import { useMatches } from '~/contexts/matches';

const drawerWidth = 300;

type Props = {
	isOpen: boolean,
	onClose: () => void,
}

function MatchTimerDialog({ isOpen, onClose }: Props) {
	const [isOpenMatchListDrawer, setIsOpenMatchListDrawer] = useState(false);

	const { resetTimer } = useTimer();
	const { matches, currentMatchIndex, nextMatch, jumpMatch } = useMatches();

	const [play] = useSound(sound);

	function handleClose() {
		setIsOpenMatchListDrawer(false);
		onClose();
	}

	function handleOpenMatchListDrawer() {
		setIsOpenMatchListDrawer(true);
	}
	function handleCloseMatchListDrawer() {
		setIsOpenMatchListDrawer(false);
	}
	function handleToggleMatchListDrawer() {
		setIsOpenMatchListDrawer(pre => !pre);
	}

	function handleJumpMatch(matchIndex: number) {
		resetTimer();
		jumpMatch(matchIndex);
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
						onClick={handleClose}
						aria-label="close"
					>
						<CloseIcon />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Timer{(matches.length > 0) && ' & Match'}
					</Typography>

					{(matches.length > 0) &&
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

			<Display />

			<SwipeableDrawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
				variant='persistent'
				anchor='right'
				open={isOpenMatchListDrawer}
				onOpen={handleOpenMatchListDrawer}
				onClose={handleCloseMatchListDrawer}
			>
				<Toolbar />
				<Box sx={{ overflow: 'auto' }}>
					<List disablePadding>
						{matches.map((match, i) => (
							<>
								<ListItem key={i} disablePadding sx={{ position: 'relative' }}>
									<ListItemButton
										onClick={() => handleJumpMatch(i)}
										sx={{ px: 0.5, py: 2, overflow: 'hidden' }}
									>
										<Backdrop
											open={i < currentMatchIndex}
											sx={(theme) => ({
												position: 'absolute',
												top: 0,
												left: 0,
												bottom: 0,
												right: 0,
												width: '100%',
												height: '100%',
												zIndex: theme.zIndex.drawer + 1,
											})}
											transitionDuration={500}
										/>
										<Stack
											direction='row'
											spacing={2}
											sx={{
												justifyContent: 'center',
												alignItems: 'center',
											}}
										>
											<ListItemText
												primary={`${i+1}.`}
												sx={{ width: '31.75px', textAlign: 'right' }}
											/>
											<MatchItem match={match} isContained={i === currentMatchIndex} scale={1} />
										</Stack>
									</ListItemButton>
								</ListItem>
								{/* <Divider /> */}
							</>
						))}
					</List>
				</Box>
			</SwipeableDrawer>
		</Dialog>
	)
}

export default MatchTimerDialog;
