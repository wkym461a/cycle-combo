import Header from './components/Header';
import MatchList from './components/MatchList';
import MatchStatus from './components/MatchStatus';

import style from './styles/BasicLayout.module.css';

function BasicLayout() {
	return (
		<div className={style.container}>
			<div className={style.status}>
				<MatchStatus />
			</div>
			<div className={style.statusSpacer} />
			<div className={style.subcontainer}>
				<div className={style.header}>
					<Header />
				</div>
				<div className={style.listContainer}>
					<MatchList />
				</div>
			</div>
		</div>
	);
}

export default BasicLayout;
