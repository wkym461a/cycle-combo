import { useRegisterSW } from 'virtual:pwa-register/react';

import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
	/** true の間は通知を出さない（タイマー実行中にリロードさせないため） */
	suppressed: boolean,
}

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

/**
 * 新しいバージョンが配信されたことを知らせ、ユーザーの操作でだけ更新（リロード）する。
 * ホーム画面から起動する PWA はページ遷移が起きず更新チェックが走らないため、定期的にも確認する。
 */
function UpdatePrompt({ suppressed }: Props) {
	const {
		needRefresh: [needRefresh, setNeedRefresh],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (!registration) return;
			window.setInterval(() => { registration.update().catch(() => {}); }, UPDATE_CHECK_INTERVAL_MS);
		},
	});

	return (
		<Snackbar
			open={needRefresh && !suppressed}
			message="新しいバージョンがあります"
			anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
			sx={{ mb: 'env(safe-area-inset-bottom)' }}
			action={
				<>
					<Button color="primary" size="small" onClick={() => updateServiceWorker(true)}>
						更新
					</Button>
					<IconButton size="small" color="inherit" aria-label="close" onClick={() => setNeedRefresh(false)}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</>
			}
		/>
	);
}

export default UpdatePrompt;
