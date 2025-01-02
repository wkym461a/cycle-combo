import 'react';
import { TimerProvider } from '~/contexts/timer';
import { MatchesProvider } from '~/contexts/matches';
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
		<TimerProvider>
		<MatchesProvider>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<Home />
		</ThemeProvider>
		</MatchesProvider>
		</TimerProvider>
  )
}

export default App;
