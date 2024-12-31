import Header from './components/Header';
import MatchList from './components/MatchList';
import MatchStatus from './components/MatchStatus';

import style from './styles/SpPortraitLayout.module.css';

function SpPortraitLayout() {
	return (
		<div className={style.container}>
			<div className={style.header}>
				<Header />
			</div>
			<div className={style.status}>
				<MatchStatus />
			</div>
			<div className={style.listContainer}>
				<MatchList />
			</div>
		</div>
	);
}

export default SpPortraitLayout;
