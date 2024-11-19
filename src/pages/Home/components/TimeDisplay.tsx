import style from "./styles/TimeDisplay.module.css";

type Props = {
	timer_s: number,
	onStartStop: () => void,
}

function TimeDisplay({ timer_s, onStartStop }: Props) {

	const min = Math.floor(timer_s / 60).toString().padStart(2, '0');
	const sec = Math.floor(timer_s % 60).toString().padStart(2, '0');

	return (
		<div className={style.container} onClick={onStartStop}>
			{`${min}:${sec}`}
		</div>
	);
}

export default TimeDisplay;
