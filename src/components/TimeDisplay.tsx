
type Props = {
	timer_s: number,
	onStartStop: () => void,
}

function TimeDisplay({ timer_s, onStartStop }: Props) {

	const min = Math.floor(timer_s / 60).toString().padStart(2, '0');
	const sec = Math.floor(timer_s % 60).toString().padStart(2, '0');

	return (
		<div onClick={onStartStop}>
			{`${min}:${sec} (${timer_s}[s])`}
		</div>
	);
}

export default TimeDisplay;
