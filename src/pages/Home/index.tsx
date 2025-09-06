import { useState } from 'react';

import Button from '@mui/material/Button';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import ConfirmModal from "~/components/ConfirmModal";
import MatchTimerDialog from './MatchTimerDialog';

import { useTimer } from '~/contexts/timer';
import { useMatches } from '~/contexts/matches';
import { useAudio } from '~/contexts/audio';

const TIMER_SELECT_LIST = [...Array(10)].map((_, i) => i+1);

const getCurrentVersion = (): string => {
	return import.meta.env.VITE_VERSION;
}
const getCurrentRevision = (): string => {
	return import.meta.env.VITE_REVISION;
}

function Home() {
	const [isOpenTimerDialog, setIsOpenTimerDialog] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [timer_min, setTimer_min] = useState('3');
	const [peopleNum, setPeopleNum] = useState('');

	const { setInitTimer, startTimer, stopTimer, resetTimer } = useTimer();
	const { createMatches, clearMatches } = useMatches();
	const { resume, play } = useAudio();

	function handleOpenTimerDialog() {
		setInitTimer(Number(timer_min) * 60);
		resetTimer();
		startTimer();

		createMatches(Number(peopleNum));

		resume();

		setIsOpenTimerDialog(true);
	}
	function handleCloseTimerDialog() {
		setIsOpenTimerDialog(false);

		clearMatches();

		stopTimer();
	}

  function handleTimerChange(event: SelectChangeEvent) {
    setTimer_min(event.target.value);
  };
  function handlePeopleNumChange(event: SelectChangeEvent) {
    setPeopleNum(event.target.value);
  };

	function handleOpenModal() {
		resume();

		setIsModalOpen(true);
	}
	function handleModalClose() {
		setIsModalOpen(false);
	}
	function handleConfirmClose() {
		play();

		setIsModalOpen(false);
	}

  return (
		<>
			<Container maxWidth={false} disableGutters>
				<AppBar position='sticky'>
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							バドミントン部タイマ
						</Typography>
					</Toolbar>
				</AppBar>

				<Container maxWidth='sm'>
					<Stack
						spacing={8}
						mt={8}
						mb={16}
						sx={{
							alignItems: 'center',
						}}
					>
						<FormControl sx={{ width: '100%' }}>
							<InputLabel id="label-select-timer-min">タイマ</InputLabel>
							<Select
								labelId="label-select-timer-min"
								id="select-timer-min"
								value={timer_min}
								label="タイマ"
								onChange={handleTimerChange}
							>
								{TIMER_SELECT_LIST.map(i => (
									<MenuItem key={i} value={i}>{i}分</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl sx={{ width: '100%' }}>
							<InputLabel id="label-select-people-num">人数</InputLabel>
							<Select
								labelId="label-select-people-num"
								id="select-people-num"
								value={peopleNum}
								label="人数"
								onChange={handlePeopleNumChange}
							>
								<MenuItem value="">なし</MenuItem>
								<MenuItem value={4}>4人</MenuItem>
								<MenuItem value={5}>5人</MenuItem>
								<MenuItem value={6}>6人</MenuItem>
								<MenuItem value={7}>7人</MenuItem>
								<MenuItem value={8}>8人</MenuItem>
								<MenuItem value={9}>9人</MenuItem>
								<MenuItem value={10}>10人</MenuItem>
							</Select>
						</FormControl>

						<Button
							fullWidth
							variant='contained'
							onClick={handleOpenTimerDialog}
						>
							開始
						</Button>

						<Button
							variant='text'
							onClick={handleOpenModal}
						>
							音声テスト
						</Button>

						<Typography
							component='div'
						>
							ver.{getCurrentVersion()} (r{getCurrentRevision()})
						</Typography>
					</Stack>
				</Container>
			</Container>

			<MatchTimerDialog
				isOpen={isOpenTimerDialog}
				onClose={handleCloseTimerDialog}
			/>

			<ConfirmModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onConfirm={handleConfirmClose}
				title='タイマ音を再生します'
				description='iOSの場合、消音モードを解除してください。音が出ます。注意してください。'
			/>
		</>
  )
}

export default Home;
