import CustomModal from './CustomModal';
import style from './ConfirmModal.module.css';

type Props = {
	title: string,
	description?: string,
	onConfirm: () => void,
	onCancel: () => void,
};

function ConfirmModal({ title, description, onConfirm, onCancel }: Props) {

	return (
		<CustomModal onClose={onCancel}>
			<div>{title}</div>
			{(description) &&
				<div>{description}</div>
			}
			<div>
				<div onClick={onConfirm}>はい</div>
				<div onClick={onCancel}>いいえ</div>
			</div>
		</CustomModal>
	);
}

export default ConfirmModal;