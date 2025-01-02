import { useState } from 'react';

import Button from '@mui/material/Button';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import MatchTimerDialog from './MatchTimerDialog';

import { useTimer } from '~/contexts/timer';
import { useMatches } from '~/contexts/matches';

const TIMER_SELECT_LIST = [...Array(10)].map((_, i) => i+1);

function Home() {
	const [isOpenTimerDialog, setIsOpenTimerDialog] = useState(false);

	const [timer_min, setTimer_min] = useState('3');
	const [peopleNum, setPeopleNum] = useState('');

	const { setInitTimer, startTimer, stopTimer, resetTimer } = useTimer();
	const { createMatches, clearMatches } = useMatches();

	function handleOpenTimerDialog() {
		setInitTimer(Number(timer_min) * 60);
		resetTimer();
		startTimer();

		createMatches(Number(peopleNum));

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

  return (
		<>
			<Container maxWidth={false} disableGutters>
				<AppBar position='sticky'>
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							Cycle Combo
						</Typography>
						<IconButton
							size="large"
							edge="start"
							color="inherit"
							aria-label="help"
						>
							<HelpIcon />
						</IconButton>
					</Toolbar>
				</AppBar>

				<Container maxWidth='sm'>
					<Stack spacing={8} mt={8} mb={16}>
						<FormControl sx={{ width: '100%' }}>
							<InputLabel id="label-select-timer-min">タイマー</InputLabel>
							<Select
								labelId="label-select-timer-min"
								id="select-timer-min"
								value={timer_min}
								label="タイマー"
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
							variant='contained'
							onClick={handleOpenTimerDialog}
						>
							開始
						</Button>
					</Stack>
				</Container>
			</Container>

			<MatchTimerDialog
				isOpen={isOpenTimerDialog}
				onClose={handleCloseTimerDialog}
			/>
		</>
  )
}

export default Home;
