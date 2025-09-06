
import { Match } from '~/contexts/matches';

import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typograpy from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

type Props = {
	match: Match,
	scale: number,
	isContained: boolean,
}

const playerSx = {
	width: '48px',
	height: '40px',
	fontSize: '40px',
	fontWeight: 600,
};
function MatchItem({ match, scale, isContained }: Props) {
	const appTheme = useTheme();
	const theme = createTheme(
		{ ...appTheme },
		{
			components: {
				MuiButton: {
					styleOverrides: {
						root: {
							"&.Mui-disabled": (isContained)
								? {
									color: 'white',
									backgroundColor: `${appTheme.palette.primary.dark}cc`,
								}
								: {
									color: appTheme.palette.primary.main,
									borderColor: appTheme.palette.primary.main,
								},
						}
					}
				}
			}
		}
	);

	const variant = (isContained) ? 'contained' : 'outlined';
	return (
		<ThemeProvider theme={theme}>
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
					<Button
						variant={variant}
						disabled
						disableElevation
						sx={playerSx}
					>
						{match[0][0]}
					</Button>
					<Button
						variant={variant}
						disabled
						disableElevation
						sx={playerSx}
					>
						{match[0][1]}
					</Button>
				</ButtonGroup>
				<Typograpy sx={{ fontSize: '18px' }}>vs.</Typograpy>
				<ButtonGroup>
					<Button
						variant={variant}
						disabled
						disableElevation
						sx={playerSx}
					>
						{match[1][0]}
					</Button>
					<Button
						variant={variant}
						disabled
						disableElevation
						sx={playerSx}
					>
						{match[1][1]}
					</Button>
				</ButtonGroup>
			</Stack>
		</Box>
		</ThemeProvider>
	);
}

export default MatchItem;
