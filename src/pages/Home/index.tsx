import 'react';
import { mediaQuery, useMediaQuery } from '~/useMediaQuery';
import { useOrientation } from '~/useOrientation';
import useSound from 'use-sound';
import BasicLayout from './BasicLayout';
import SpPortraitLayout from './SpPortraitLayout';
import style from './styles/Home.module.css';
import sound from '~/assets/timer.mp3';
import { TimerProvider } from '~/contexts/timer';
import { MatchProvider } from '~/contexts/matches';

function Home() {
	const isSp = useMediaQuery(mediaQuery.sp);
	const orientation = useOrientation();
	const isPortrait = (
		orientation.type === "portrait-primary" ||
		orientation.type === "portrait-secondary"
	);

	const [play] = useSound(sound);

  return (
		<TimerProvider>
		<MatchProvider>
			{
				// 基本レイアウト
				!(isPortrait && isSp) ?
				<BasicLayout />
				:

				// 特殊レイアウト（スマホ縦向き）
				<SpPortraitLayout />
			}
		</MatchProvider>
		</TimerProvider>
  )
}

export default Home;
