/* eslint-disable react-refresh/only-export-components -- Provider と hooks を同じファイルで公開する */
import React, { createContext, PropsWithChildren, useContext, useMemo, useRef } from "react";
import NoSleep from 'nosleep.js';

// 外部公開する操作
type WakeLockContextType = {
	enableWakeLock: () => void,
	disableWakeLock: () => void,
}

const WakeLockContext = createContext<WakeLockContextType | undefined>(undefined);

export const WakeLockProvider: React.FC<PropsWithChildren> = ({ children }) => {
	const noSleepRef = useRef<NoSleep>();
	if (!noSleepRef.current) {
		noSleepRef.current = new NoSleep();
	}

	const value = useMemo<WakeLockContextType>(() => ({
		// ユーザー操作（開始ボタン押下）のコールバック内から呼ぶ必要がある
		// （iOSではユーザー操作なしのvideo再生・Wake Lock取得が許可されないため）
		enableWakeLock: () => { noSleepRef.current?.enable().catch(() => {}); },
		disableWakeLock: () => { noSleepRef.current?.disable(); },
	}), []);

	return <WakeLockContext.Provider value={value}>{children}</WakeLockContext.Provider>;
}

export const useWakeLock = () => {
	const context = useContext(WakeLockContext);
	if (context === undefined) {
		throw new Error('useWakeLock must be within a WakeLockProvider');
	}
	return context;
}
