import { useEffect, useState } from 'react';
import { mediaQuery, useMediaQuery } from '~/useMediaQuery';
import { useOrientation } from '~/useOrientation';
import useSound from 'use-sound';
import BasicLayout from './BasicLayout';
import SpPortraitLayout from './SpPortraitLayout';
import style from './styles/Home.module.css';
import sound from '~/assets/timer.mp3';

const TIMER_INIT_SEC = 5 * 60;
let timeoutID: number | undefined = undefined;

function Home() {
	const [timer_s, setTimer_s] = useState(TIMER_INIT_SEC);
	const [isTimerRunning, setIsTimerRunning] = useState(true);

	const isSp = useMediaQuery(mediaQuery.sp);
	const orientation = useOrientation();
	const isPortrait = (
		orientation.type === "portrait-primary" ||
		orientation.type === "portrait-secondary"
	);

	const [play, { stop }] = useSound(sound);

	// タイマ再生・停止ハンドラ
	function handleStartStopTimer() {
		setIsTimerRunning((pre) => (!pre));
		stop();
	}

	// タイマリセットハンドラ
	function handleResetTimer() {
		window.clearTimeout(timeoutID);
		setTimer_s(TIMER_INIT_SEC);
		setIsTimerRunning(true);
		stop();
	}

	useEffect(() => {
		if ((!isTimerRunning) || (timer_s <= 0)) {
			window.clearTimeout(timeoutID);
			timeoutID = undefined;
			return;
		}

		// タイマカウントダウン設定
		window.clearTimeout(timeoutID);
		timeoutID = window.setTimeout(() => {
			setTimer_s((pre) => (pre - 1));

			if (timer_s <= 1) {
				setTimer_s(TIMER_INIT_SEC);
				play();
			}
		}, 1000);

	}, [timer_s, isTimerRunning]);

  return (
		// 基本レイアウト
		!(isPortrait && isSp) ?
		<BasicLayout
			timer_s={timer_s}
			onStartStopTimer={handleStartStopTimer}
			onResetTimer={handleResetTimer}
		/>
		:

		// 特殊レイアウト（スマホ縦向き）
		<SpPortraitLayout
			timer_s={timer_s}
			onStartStopTimer={handleStartStopTimer}
			onResetTimer={handleResetTimer}
		/>
  )
}

export default Home;
