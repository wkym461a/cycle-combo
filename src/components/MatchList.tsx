import style from "./MatchList.module.css";

const matches = [
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["11", "12"], ["13", "14"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["11", "12"], ["13", "14"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["1", "2"], ["3", "4"]],
	[["11", "12"], ["13", "14"]],
];

function MatchList() {

	return (
		<div>
		{matches.map((m, i) => (
			<div key={i} className={style.listItem}>
				{`${m[0][0]}, ${m[0][1]} vs. ${m[1][0]}, ${m[1][1]}`}
			</div>
		))}
		</div>
	);
}

export default MatchList;
