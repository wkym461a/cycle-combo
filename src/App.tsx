import { mediaQuery, useMediaQuery } from './useMediaQuery';
import './App.css';

function App() {
	const isSp = useMediaQuery(mediaQuery.sp);
	const isTablet = useMediaQuery(mediaQuery.tablet);
	const isPc = useMediaQuery(mediaQuery.pc);

  return (
    <>
		{
			(isSp) ?
			<p>Viewing on SP.</p>
			:
			(isTablet) ?
			<p>Viewing on Tablet.</p>
			:
			(isPc) ?
			<p>Viewing on PC.</p>
			:
			<p>Viewing on Unknown Device.</p>
		}
    </>
  )
}

export default App;
