import { memo } from 'react';
import { Match } from '~/contexts/matches';

import { alpha, SxProps, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

type Props = {
	match: Match,
	scale: number,
	isContained: boolean,
}

// 選手番号を表すボタン。disabled で操作不能にしつつ、見た目は disabled らしくならないよう上書きする
const playerSx = (isContained: boolean): SxProps<Theme> => (theme) => ({
	width: '48px',
	height: '40px',
	minWidth: '48px',
	padding: 0,
	lineHeight: 1,
	fontSize: '40px',
	fontWeight: 600,
	// && で ButtonGroup 側の .Mui-disabled 指定より優先させる
	'&&.Mui-disabled': (isContained)
		? {
			color: theme.palette.common.white,
			backgroundColor: alpha(theme.palette.primary.dark, 0.8),
		}
		: {
			color: theme.palette.primary.main,
			borderColor: theme.palette.primary.main,
		},
});

function MatchItem({ match, scale, isContained }: Props) {
	const variant = (isContained) ? 'contained' : 'outlined';
	const sx = playerSx(isContained);

	return (
		<Box sx={{ transform: `scale(${scale})` }}>
			<Stack
				spacing={1}
				direction='row'
				sx={{
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<ButtonGroup>
					<Button variant={variant} disabled disableElevation sx={sx}>{match[0][0]}</Button>
					<Button variant={variant} disabled disableElevation sx={sx}>{match[0][1]}</Button>
				</ButtonGroup>
				<Typography sx={{ fontSize: '18px' }}>vs.</Typography>
				<ButtonGroup>
					<Button variant={variant} disabled disableElevation sx={sx}>{match[1][0]}</Button>
					<Button variant={variant} disabled disableElevation sx={sx}>{match[1][1]}</Button>
				</ButtonGroup>
			</Stack>
		</Box>
	);
}

// 試合組の内容は定数なので、現在の組が変わったときだけ再描画されればよい
export default memo(MatchItem);
