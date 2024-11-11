import Header from '../../components/Header';
import MatchList from '../../components/MatchList';
import MatchStatus from '../../components/MatchStatus';

import style from './BasicLayout.module.css';

type Props = {
	timer_s: number,
	onStartStopTimer: () => void,
	onResetTimer: () => void,
}

function BasicLayout({ timer_s, onStartStopTimer, onResetTimer }: Props) {
	return (
		<div className={style.container}>
			<div className={style.status}>
				<MatchStatus timer_s={timer_s} onStartStop={onStartStopTimer} />
			</div>
			<div className={style.statusSpacer} />
			<div className={style.subcontainer}>
				<div className={style.header}>
					<Header />
				</div>
				<div className={style.listContainer}>
					<MatchList onResetTimer={onResetTimer} />
				</div>
			</div>
		</div>
	);
}

export default BasicLayout;
