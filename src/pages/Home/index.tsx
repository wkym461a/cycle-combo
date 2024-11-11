import { useEffect, useState } from 'react';
import { mediaQuery, useMediaQuery } from '~/useMediaQuery';
import { useOrientation } from '~/useOrientation';
import BasicLayout from './BasicLayout';
import SpPortraitLayout from './SpPortraitLayout';
import style from './styles/Home.module.css';

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

	// タイマ再生・停止ハンドラ
	function handleStartStopTimer() {
		setIsTimerRunning((pre) => (!pre));
	}

	// タイマリセットハンドラ
	function handleResetTimer() {
		window.clearTimeout(timeoutID);
		setTimer_s(TIMER_INIT_SEC);
		setIsTimerRunning(true);
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