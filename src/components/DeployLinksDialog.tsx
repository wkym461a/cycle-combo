import { QRCodeSVG } from 'qrcode.react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';

import { DEPLOY_TARGETS, getCurrentDeployTarget } from '~/lib/deployUrls';

type Props = {
	isOpen: boolean,
	onClose: () => void,
}

const QR_SIZE = 160;

/** 本番・開発それぞれの配信先URLをQRコード付きで表示する */
function DeployLinksDialog({ isOpen, onClose }: Props) {
	const current = getCurrentDeployTarget();

	return (
		<Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="xs">
			<DialogTitle>配信先のリンク</DialogTitle>
			<DialogContent>
				<Stack spacing={3} sx={{ alignItems: 'stretch', pt: 1 }}>
					{DEPLOY_TARGETS.map(target => (
						<Stack key={target.key} spacing={1} sx={{ alignItems: 'center' }}>
							<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
								<Typography variant="h6" component="div">{target.label}</Typography>
								{current?.key === target.key &&
									<Chip label="今開いている環境" size="small" color="primary" variant="outlined" />
								}
							</Stack>
							<Typography variant="caption" color="text.secondary">{target.description}</Typography>
							{/* QRは読み取りやすさのため常に白地・黒で描く */}
							<Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 1, lineHeight: 0 }}>
								<QRCodeSVG value={target.url} size={QR_SIZE} level="M" bgColor="#ffffff" fgColor="#000000" />
							</Box>
							<Link
								href={target.url}
								target="_blank"
								rel="noopener noreferrer"
								variant="body2"
								sx={{ wordBreak: 'break-all', textAlign: 'center' }}
							>
								{target.url}
							</Link>
						</Stack>
					))}
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>閉じる</Button>
			</DialogActions>
		</Dialog>
	);
}

export default DeployLinksDialog;
