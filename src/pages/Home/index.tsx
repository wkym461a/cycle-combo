import { useState } from 'react';

import Button from '@mui/material/Button';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import QrCode2Icon from '@mui/icons-material/QrCode2';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';

import MatchTimerDialog from './MatchTimerDialog';
import UpdatePrompt from '~/components/UpdatePrompt';
import DeployLinksDialog from '~/components/DeployLinksDialog';

import { useTimerActions } from '~/contexts/timer';
import { useMatchesActions } from '~/contexts/matches';
import { PEOPLE_NUM_OPTIONS } from '~/contexts/matches/consts';
import { useAudioActions, useAudioState, SOUND_TYPES, SOUND_TYPE_LABELS, SoundType, MIN_VOLUME, MAX_VOLUME } from '~/contexts/audio';
import { useWakeLock } from '~/contexts/wakeLock';
import { useConfirm } from '~/hooks/useConfirm';
import { loadSessionActive, loadSettings, saveSessionActive, updateSettings } from '~/lib/settings';

const TIMER_SELECT_LIST = [...Array(10)].map((_, i) => i+1);
const DEFAULT_TIMER_MIN = 3;

const getCurrentVersion = (): string => {
	return import.meta.env.VITE_VERSION;
}

// 開発版（/cycle-combo/dev/ 配信）か。利用者はバージョン番号を意識しないので、番号とは別に明示的なラベルで示す
const IS_DEV_CHANNEL = import.meta.env.VITE_DEPLOY_CHANNEL === 'dev';

function restoreTimerMin(): number {
	const value = loadSettings().timerMin;
	return (typeof value === 'number' && TIMER_SELECT_LIST.includes(value)) ? value : DEFAULT_TIMER_MIN;
}
function restorePeopleNum(): number {
	const value = loadSettings().peopleNum;
	return (typeof value === 'number' && PEOPLE_NUM_OPTIONS.includes(value)) ? value : 0;
}

function Home() {
	// リロード前にタイマー実行中だったなら、そのまま実行画面に戻る（タイマー・試合組の状態も各 Provider が復元する）
	const [isOpenTimerDialog, setIsOpenTimerDialog] = useState(loadSessionActive);
	const [isOpenDeployLinks, setIsOpenDeployLinks] = useState(false);

	const [timerMin, setTimerMin] = useState(restoreTimerMin);
	const [peopleNum, setPeopleNum] = useState(restorePeopleNum);

	const { beginTimer, endTimer } = useTimerActions();
	const { createMatches, clearMatches } = useMatchesActions();
	const { soundType, volume, isReady } = useAudioState();
	const { activateSession, deactivateSession, playTest, selectSound, setVolume } = useAudioActions();
	const { enableWakeLock, disableWakeLock } = useWakeLock();
	const { confirm, confirmDialog } = useConfirm();

	function handleOpenTimerDialog() {
		// 音声の解放と WakeLock はユーザー操作（このクリック）の文脈で行う必要がある
		void activateSession();
		enableWakeLock();

		beginTimer(timerMin * 60 * 1000);
		createMatches(peopleNum);

		saveSessionActive(true);
		setIsOpenTimerDialog(true);
	}
	function handleCloseTimerDialog() {
		saveSessionActive(false);
		setIsOpenTimerDialog(false);

		clearMatches();
		endTimer();

		deactivateSession();
		disableWakeLock();
	}

	function handleTimerChange(event: SelectChangeEvent<number>) {
		const value = Number(event.target.value);
		setTimerMin(value);
		updateSettings({ timerMin: value });
	}
	function handlePeopleNumChange(event: SelectChangeEvent<number>) {
		const value = Number(event.target.value);
		setPeopleNum(value);
		updateSettings({ peopleNum: value });
	}
	function handleSoundTypeChange(event: SelectChangeEvent) {
		selectSound(event.target.value as SoundType);
	}
	function handleVolumeChange(_event: Event, value: number | number[]) {
		setVolume(value as number);
	}

	async function handleSoundTest() {
		const ok = await confirm({
			title: 'タイマ音を再生します',
			description: '音が出ます。音量に注意してください。',
		});
		if (ok) {
			void playTest();
		}
	}

	return (
		<>
			<Container maxWidth={false} disableGutters>
				<AppBar
					position='sticky'
					sx={{
						pt: 'env(safe-area-inset-top)',
						pl: 'env(safe-area-inset-left)',
						pr: 'env(safe-area-inset-right)',
					}}
				>
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							バドミントン部タイマ
						</Typography>
						<IconButton
							edge="end"
							color="inherit"
							aria-label="配信先のリンクを表示"
							onClick={() => setIsOpenDeployLinks(true)}
						>
							<QrCode2Icon />
						</IconButton>
					</Toolbar>
				</AppBar>

				<Container maxWidth='sm' sx={{ pb: 'env(safe-area-inset-bottom)' }}>
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
								value={timerMin}
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
								<MenuItem value={0}>なし</MenuItem>
								{PEOPLE_NUM_OPTIONS.map(n => (
									<MenuItem key={n} value={n}>{n}人</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl sx={{ width: '100%' }}>
							<InputLabel id="label-select-sound-type">タイマー音</InputLabel>
							<Select
								labelId="label-select-sound-type"
								id="select-sound-type"
								value={soundType}
								label="タイマー音"
								onChange={handleSoundTypeChange}
							>
								{SOUND_TYPES.map(type => (
									<MenuItem key={type} value={type}>{SOUND_TYPE_LABELS[type]}</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl sx={{ width: '100%' }}>
							<Typography id="label-slider-volume" gutterBottom>
								音量 ({Math.round(volume * 100)}%)
							</Typography>
							<Slider
								aria-labelledby="label-slider-volume"
								value={volume}
								min={MIN_VOLUME}
								max={MAX_VOLUME}
								step={0.1}
								onChange={handleVolumeChange}
								valueLabelDisplay="off"
							/>
						</FormControl>

						<Button
							fullWidth
							variant='contained'
							disabled={!isReady}
							onClick={handleOpenTimerDialog}
						>
							{isReady ? '開始' : '音源を読み込み中…'}
						</Button>

						<Button
							variant='text'
							disabled={!isReady}
							onClick={handleSoundTest}
						>
							音声テスト
						</Button>

						<Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
							<Typography component='div'>
								ver.{getCurrentVersion()}
							</Typography>
							{IS_DEV_CHANNEL &&
							<Chip label="開発版" size="small" color="warning" />
							}
						</Stack>
					</Stack>
				</Container>
			</Container>

			<MatchTimerDialog
				isOpen={isOpenTimerDialog}
				onClose={handleCloseTimerDialog}
			/>

			<DeployLinksDialog
				isOpen={isOpenDeployLinks}
				onClose={() => setIsOpenDeployLinks(false)}
			/>

			{confirmDialog}

			<UpdatePrompt suppressed={isOpenTimerDialog} />
		</>
	)
}

export default Home;
