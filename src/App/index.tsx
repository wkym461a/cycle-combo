import 'react';
import { TimerProvider } from '~/contexts/timer';
import { MatchesProvider } from '~/contexts/matches';
import { AudioProvider } from '~/contexts/audio';
import Home from '~/pages/Home';

import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
	const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
	const theme = createTheme({
		palette: {
			mode: isDarkMode ? 'dark' : 'light',
		},
	});

  return (
		<AudioProvider>
		<TimerProvider>
		<MatchesProvider>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Home />
		</ThemeProvider>
		</MatchesProvider>
		</TimerProvider>
		</AudioProvider>
  )
}

export default App;
