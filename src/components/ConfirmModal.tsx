import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { SxProps } from '@mui/material';

type Props = {
	isOpen: boolean,
	onClose: () => void,
	onConfirm: () => void,
	title: string,
	description?: string,
}

const sx: SxProps = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	boxShadow: 24,
	p: 4,
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, description }: Props) {

	return (
		<Modal
			open={isOpen}
			onClose={onClose}
		>
			<Box sx={sx}>
				<Typography color='text.primary' variant="h5" component="h2">
					{title}
				</Typography>

				{(description) &&
				<Typography color='text.secondary' sx={{ mt: 1 }}>
					{description}
				</Typography>
				}

				<Stack
					direction='row'
					spacing={2}
					sx={{
						mt: 3,
						justifyContent: 'flex-end',
						alignItems: 'center',
					}}
				>
					<Button
						variant='text'
						color='primary'
						onClick={onConfirm}
						sx={{
							fontWeight: 700,
						}}
					>
						はい
					</Button>
					<Button
						variant='text'
						color='error'
						onClick={onClose}
					>
						いいえ
					</Button>
				</Stack>
			</Box>
		</Modal>
	);
}

export default ConfirmModal;
