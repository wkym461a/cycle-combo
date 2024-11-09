import { mediaQuery, useMediaQuery } from '~/useMediaQuery';
import { useOrientation } from '~/useOrientation';
import style from './App.module.css';

import Header from '~/components/Header';
import MatchList from '~/components/MatchList';
import MatchStatus from '~/components/MatchStatus';
import { useEffect, useState } from 'react';

const TIMER_INIT_SEC = 5 * 60;
let timeoutID: number | undefined;

function App() {
	const [timer_s, setTimer_s] = useState(TIMER_INIT_SEC);
	const [isTimerRunning, setIsTimerRunning] = useState(true);

	const isSp = useMediaQuery(mediaQuery.sp);
	const orientation = useOrientation();
	const isPortrait = (
		orientation.type === "portrait-primary" ||
		orientation.type === "portrait-secondary"
	);

	function handleStartStopTimer() {
		setIsTimerRunning((pre) => (!pre));
	}
	function handleResetTimer() {
		setTimer_s(TIMER_INIT_SEC);
		setIsTimerRunning(true);
	}

	useEffect(() => {
		if (!isTimerRunning) {
			if (timeoutID != undefined) {
				window.clearTimeout(timeoutID);
				timeoutID = undefined;
			}
			return;
		}
		if (timer_s <= 0) {
			return;
		}

		if (timeoutID != undefined) {
			window.clearTimeout(timeoutID);
		}
		timeoutID = window.setTimeout(() => {
			setTimer_s((pre) => (pre - 1));
		}, 1000);

	}, [timer_s, isTimerRunning]);

  return (
		// 基本レイアウト
		!(isPortrait && isSp) ?
		<div className={style.container}>
			<div className={style.status}>
				<MatchStatus timer_s={timer_s} onStartStop={handleStartStopTimer} />
			</div>
			<div className={style.statusSpacer} />
			<div className={style.subcontainer}>
				<div className={style.header}>
					<Header />
				</div>
				<div className={style.listContainer}>
					<MatchList onResetTimer={handleResetTimer} />
				</div>
			</div>
		</div>
		:

		// 特殊レイアウト（スマホ縦向き）
		<div className={style.spContainer}>
			<div className={style.spHeader}>
				<Header />
			</div>
			<div className={style.spStatus}>
				<MatchStatus timer_s={timer_s} onStartStop={handleStartStopTimer} />
			</div>
			<div className={style.spListContainer}>
				<MatchList onResetTimer={handleResetTimer} />
			</div>
		</div>
  )
}

export default App;
