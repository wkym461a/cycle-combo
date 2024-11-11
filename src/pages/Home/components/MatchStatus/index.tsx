import { CSSProperties, useEffect, useRef, useState } from "react";
import style from "./MatchStatus.module.css";
import MatchItem from "../MatchItem";
import TimeDisplay from "../TimeDisplay";

const CONTENT_WIDTH = 480;
const CONTENT_HEIGHT = 360;

type Props = {
	timer_s: number,
	onStartStop: () => void,
}

function MatchStatus({ timer_s, onStartStop }: Props) {
	const ref = useRef<HTMLDivElement>(null);

	const useScale = () => {
		const [scale, setScale] = useState(1);

		useEffect(() => {
			function handleResize() {
				const rect = ref.current?.getBoundingClientRect();
				const width = rect?.width ?? CONTENT_WIDTH;
				const height = rect?.height ?? CONTENT_HEIGHT;
				console.log(rect);

				const scaleX = width / CONTENT_WIDTH;
				const scaleY = height / CONTENT_HEIGHT;

				const dynamicScale = Math.min(scaleX, scaleY);

				setScale(dynamicScale);
			}

			handleResize();

			window.addEventListener('resize', handleResize);

			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}, []);

		return { scale }
	}
	const { scale } = useScale();

	const scaleStyle: CSSProperties = {
		top: '50%',
		left: '50%',
		transform: `scale(${scale}) translate(-50%, -50%)`,
		transformOrigin: 'top left',
		width: `${CONTENT_WIDTH}px`,
		height: `${CONTENT_HEIGHT}px`,
	}

	return (
		<div className={style.container} ref={ref}>
			<div className={style.subcontainer} style={scaleStyle}>
				<TimeDisplay timer_s={timer_s} onStartStop={onStartStop} />
				<MatchItem />
			</div>
		</div>
	);
}

export default MatchStatus;
