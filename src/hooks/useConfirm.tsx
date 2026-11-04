import { ReactNode, useCallback, useRef, useState } from 'react';
import ConfirmModal from '~/components/ConfirmModal';

type ConfirmOptions = {
	title: string,
	description?: string,
}

/**
 * 確認モーダルを Promise で扱うフック。
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (await confirm({ title: '...' })) { ... }
 *   return <>...{confirmDialog}</>;
 */
export function useConfirm(): { confirm: (options: ConfirmOptions) => Promise<boolean>, confirmDialog: ReactNode } {
	const [options, setOptions] = useState<ConfirmOptions | null>(null);
	// 閉じるアニメーション中もタイトルを保つため、直近の内容を覚えておく
	const lastRef = useRef<ConfirmOptions>({ title: '' });
	const resolveRef = useRef<((ok: boolean) => void) | null>(null);

	const confirm = useCallback((next: ConfirmOptions) => {
		// 前の確認が開いたまま呼ばれた場合は、前のものをキャンセル扱いにする
		resolveRef.current?.(false);
		lastRef.current = next;
		return new Promise<boolean>((resolve) => {
			resolveRef.current = resolve;
			setOptions(next);
		});
	}, []);

	const settle = (ok: boolean) => {
		const resolve = resolveRef.current;
		resolveRef.current = null;
		setOptions(null);
		resolve?.(ok);
	};

	const shown = options ?? lastRef.current;
	const confirmDialog = (
		<ConfirmModal
			isOpen={options !== null}
			onClose={() => settle(false)}
			onConfirm={() => settle(true)}
			title={shown.title}
			description={shown.description}
		/>
	);

	return { confirm, confirmDialog };
}
