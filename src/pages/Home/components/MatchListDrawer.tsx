import { useEffect, useRef } from 'react';

import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Backdrop from '@mui/material/Backdrop';
import Stack from '@mui/material/Stack';

import MatchItem from "./MatchItem";

import { useTimerActions } from '~/contexts/timer';
import { useMatchesActions, useMatchesState } from '~/contexts/matches';
import { useConfirm } from '~/hooks/useConfirm';

type Props = {
	/** 一覧の内容に確保する幅（px）。右セーフエリア分は別途加算される */
	width: number,
	isOpen: boolean,
	onClose: () => void,
}

function MatchListDrawer({ width, isOpen, onClose }: Props) {
	const { resetTimer } = useTimerActions();
	const { matches, currentMatchIndex } = useMatchesState();
	const { jumpMatch } = useMatchesActions();
	const { confirm, confirmDialog } = useConfirm();
	const listRef = useRef<HTMLUListElement>(null);

	async function handleSelect(matchIndex: number) {
		const ok = await confirm({
			title: `${matchIndex + 1}番目の試合から開始します`,
			description: 'タイマもリセットされます',
		});
		if (!ok) return;
		resetTimer();
		jumpMatch(matchIndex);
		onClose();
	}

	useEffect(() => {
		listRef.current?.children[currentMatchIndex]?.scrollIntoView(true);
	}, [currentMatchIndex]);

	const drawerWidth = `calc(${width}px + env(safe-area-inset-right))`;

	return (
		<Drawer
			sx={{
				width: drawerWidth,
				flexShrink: 0,
				[`& .MuiDrawer-paper`]: {
					width: drawerWidth,
					boxSizing: 'border-box',
					// セーフエリア分は padding で逃がし、一覧の内容には width ぶんの幅をそのまま確保する
					// （padding を width の内側に取ると横向き（ノッチ側）で内容が入りきらず右端が欠ける）
					pt: 'env(safe-area-inset-top)',
					pr: 'env(safe-area-inset-right)',
					pb: 'env(safe-area-inset-bottom)',
				},
			}}
			variant='persistent'
			anchor='right'
			open={isOpen}
			onClose={onClose}
		>
			<Toolbar />
			<Box sx={{ overflow: 'auto' }}>
				<List ref={listRef} disablePadding>
					{matches.map((match, i) => (
						<ListItem key={i} disablePadding sx={{ position: 'relative' }}>
							<ListItemButton
								onClick={() => handleSelect(i)}
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
					))}
				</List>
			</Box>

			{confirmDialog}
		</Drawer>
	);
}

export default MatchListDrawer;
