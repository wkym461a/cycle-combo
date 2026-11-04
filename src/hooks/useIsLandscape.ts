import { useEffect, useState } from 'react';

const QUERY = '(orientation: landscape)';

/** 画面が横向きかどうか。matchMedia の change イベントで追従する。 */
export function useIsLandscape(): boolean {
	const [isLandscape, setIsLandscape] = useState(() => window.matchMedia(QUERY).matches);

	useEffect(() => {
		const mql = window.matchMedia(QUERY);
		const handleChange = (event: MediaQueryListEvent) => setIsLandscape(event.matches);
		setIsLandscape(mql.matches);

		// iOS 14 未満の Safari は addEventListener 非対応のため addListener にフォールバック
		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', handleChange);
			return () => mql.removeEventListener('change', handleChange);
		}
		mql.addListener(handleChange);
		return () => mql.removeListener(handleChange);
	}, []);

	return isLandscape;
}
