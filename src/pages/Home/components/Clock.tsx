import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';

// 現在時刻を 24時間表示（HH:mm）で返す
function formatNow(): string {
	const now = new Date();
	const hh = String(now.getHours()).padStart(2, '0');
	const mm = String(now.getMinutes()).padStart(2, '0');
	return `${hh}:${mm}`;
}

// 現在時刻の時計表示。
// iOS の横向きではステータスバー（時刻表示）が隠れるため、ヘッダ内に自前で表示する用途。
// 1秒ごとに現在時刻を確認し、分が変わったときだけ state が更新される（再描画はこのコンポーネント内に留まる）。
function Clock() {
	const [time, setTime] = useState(formatNow);

	useEffect(() => {
		const update = () => setTime(formatNow());
		const onVisibilityChange = () => {
			if (document.visibilityState === 'visible') update();
		};

		update();
		const intervalID = window.setInterval(update, 1000);
		document.addEventListener('visibilitychange', onVisibilityChange);

		return () => {
			window.clearInterval(intervalID);
			document.removeEventListener('visibilitychange', onVisibilityChange);
		};
	}, []);

	return (
		<Typography
			variant="h6"
			component="time"
			sx={{ fontVariantNumeric: 'tabular-nums' }}
			aria-label="current time"
		>
			{time}
		</Typography>
	);
}

export default Clock;
