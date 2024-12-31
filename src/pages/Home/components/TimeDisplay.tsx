import { useTimer } from "~/contexts/timer";
import style from "./styles/TimeDisplay.module.css";

function TimeDisplay() {
	const { timer_s, isRunning, startTimer, stopTimer } = useTimer();

	const min = Math.floor(timer_s / 60).toString().padStart(2, '0');
	const sec = Math.floor(timer_s % 60).toString().padStart(2, '0');

	function handleStartStop() {
		if (isRunning) {
			stopTimer();
		} else {
			startTimer();
		}
	}

	return (
		<div className={style.container} onClick={handleStartStop}>
			{`${min}:${sec}`}
		</div>
	);
}

export default TimeDisplay;
