import ButtonBase from './ButtonBase';
import ModalBase from './ModalBase';
import style from './styles/ConfirmModal.module.css';

type Props = {
	title: string,
	description?: string,
	onConfirm: () => void,
	onCancel: () => void,
};

function ConfirmModal({ title, description, onConfirm, onCancel }: Props) {

	return (
		<ModalBase onClose={onCancel}>
			<div className={style.messageContainer}>
				<div className={style.title}>{title}</div>
				{(description) &&
					<div className={style.subtitle}>{description}</div>
				}
			</div>
			<div className={style.buttonContainer}>
				<ButtonBase className={style.buttonYes} onClick={onConfirm}>はい</ButtonBase>
				<ButtonBase className={style.buttonNo} onClick={onCancel}>いいえ</ButtonBase>
			</div>
		</ModalBase>
	);
}

export default ConfirmModal;
