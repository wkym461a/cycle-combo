import { PropsWithChildren } from 'react';
import style from './CustomModal.module.css';

type Props = {
	onClose: () => void,
}

function CustomModal({ children, onClose }: PropsWithChildren<Props>) {
	function BackgroundClickHandler(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		onClose();
		event.stopPropagation(); // 重なった下の要素に伝播させない
	}

	return (
		<div className={style.background} onClick={BackgroundClickHandler}>
			<div className={style.container} onClick={(e) => { e.stopPropagation() }}>
				{children ?? <></>}
			</div>
		</div>
	);
}

export default CustomModal;
