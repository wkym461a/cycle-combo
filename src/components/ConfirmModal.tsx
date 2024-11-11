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
			<div>{title}</div>
			{(description) &&
				<div>{description}</div>
			}
			<div>
				<div onClick={onConfirm}>はい</div>
				<div onClick={onCancel}>いいえ</div>
			</div>
		</ModalBase>
	);
}

export default ConfirmModal;
