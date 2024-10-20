import { mediaQuery, useMediaQuery } from '~/useMediaQuery';
import { useOrientation } from '~/useOrientation';
import style from './App.module.css';

import Header from '~/components/Header';
import MatchList from '~/components/MatchList';
import MatchStatus from '~/components/MatchStatus';

function App() {
	const isSp = useMediaQuery(mediaQuery.sp);

	const orientation = useOrientation();
	const isPortrait = (
		orientation.type === "portrait-primary" ||
		orientation.type === "portrait-secondary"
	);

  return (
		// 基本レイアウト
		!(isPortrait && isSp) ?
		<div className={style.container}>
			<div className={style.status}>
				<MatchStatus />
			</div>
			<div className={style.statusSpacer} />
			<div className={style.list}>
				<div className={style.header}>
					<Header />
				</div>
				<div className={style.headerSpacer} />
				<MatchList />
			</div>
		</div>
		:

		// 特殊レイアウト（スマホ縦向き）
		<div className={style.spContainer}>
		<div className={style.spFBox}>
			<div className={style.spHeader}>
				<Header />
			</div>
			<div className={style.spStatus}>
				<MatchStatus />
			</div>
		</div>
		<div className={style.spFBoxSpacer} />
		<MatchList />
	</div>
  )
}

export default App;
