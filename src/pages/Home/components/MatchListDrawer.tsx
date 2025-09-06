import { useEffect, useRef, useState } from 'react';

import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Backdrop from '@mui/material/Backdrop';
import Stack from '@mui/material/Stack';

import ConfirmModal from "~/components/ConfirmModal";
import MatchItem from "./MatchItem";

import { useTimer } from '~/contexts/timer';
import { useMatches } from '~/contexts/matches';

type Props = {
	width: number,
	isOpen: boolean,
	onClose: () => void,
}

function MatchListDrawer({ width, isOpen, onClose }: Props) {
	const { resetTimer } = useTimer();
	const { matches, currentMatchIndex, jumpMatch } = useMatches();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [destMatchIndex, setDestMatchIndex] = useState(0);
	const listRef = useRef<HTMLUListElement>(null);

	function handleModalOpen(matchIndex: number) {
		setIsModalOpen(true);
		setDestMatchIndex(matchIndex);
	}
	function handleModalClose() {
		setIsModalOpen(false);
	}
	function handleConfirmJumpMatch() {
		setIsModalOpen(false);
		resetTimer();
		jumpMatch(destMatchIndex);
		onClose();
	}

	function scrollToItem(index: number) {
		if (listRef.current) {
			const itemElement = listRef.current.children[index];
			if (itemElement) {
				itemElement.scrollIntoView(true);
			}
		}
	}
	useEffect(() => {
		scrollToItem(currentMatchIndex);
	}, [currentMatchIndex]);

	return (
		<Drawer
			sx={{
				width: width,
				flexShrink: 0,
				[`& .MuiDrawer-paper`]: { width: width, boxSizing: 'border-box' },
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
								onClick={() => handleModalOpen(i)}
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

			<ConfirmModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onConfirm={handleConfirmJumpMatch}
				title={`${destMatchIndex+1}番目の試合から開始します`}
				description='タイマもリセットされます'
			/>
		</Drawer>
	);
}

export default MatchListDrawer;
