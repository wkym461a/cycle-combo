import { useState } from "react";
import ConfirmModal from "~/components/ConfirmModal";
import style from "./styles/MatchList.module.css";
import { useTimer } from "~/contexts/timer";

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
	const { resetTimer } = useTimer();
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

	function handleOpenConfirmModal() {
		setIsConfirmModalOpen(true);
	}

	function ConfirmHandler() {
		resetTimer();
		setIsConfirmModalOpen(false);
	}

	function CancelHandler() {
		setIsConfirmModalOpen(false);
	}

	return (
		<div className={style.container}>
		{matches.map((m, i) => (
			<div key={i} className={style.listItem} onClick={handleOpenConfirmModal}>
				{`${m[0][0]}, ${m[0][1]} vs. ${m[1][0]}, ${m[1][1]}`}
			</div>
		))}
		{isConfirmModalOpen &&
			<ConfirmModal
				title="次の組み合わせを開始します"
				description="タイマがリセットされますが、よろしいですか？"
				onConfirm={ConfirmHandler}
				onCancel={CancelHandler}
			/>
		}
		</div>
	);
}

export default MatchList;
