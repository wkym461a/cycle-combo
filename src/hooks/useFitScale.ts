import { RefObject, useEffect, useState } from 'react';

/**
 * ref の要素に baseWidth × baseHeight の内容を収めるための拡大率を返す。
 * 要素のサイズ変化は ResizeObserver で追従する。
 */
export function useFitScale(ref: RefObject<HTMLElement>, baseWidth: number, baseHeight: number): number {
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const update = () => {
			const { width, height } = element.getBoundingClientRect();
			if (width <= 0 || height <= 0) return;
			setScale(Math.min(width / baseWidth, height / baseHeight));
		};
		update();

		if (typeof ResizeObserver === 'undefined') {
			window.addEventListener('resize', update);
			return () => window.removeEventListener('resize', update);
		}
		const observer = new ResizeObserver(update);
		observer.observe(element);
		return () => observer.disconnect();
	}, [ref, baseWidth, baseHeight]);

	return scale;
}
