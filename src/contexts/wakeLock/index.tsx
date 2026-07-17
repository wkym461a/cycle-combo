import React, { createContext, PropsWithChildren, useContext, useRef } from "react";
import NoSleep from 'nosleep.js';

// 外部公開する操作
type WakeLockContextType = {
	enableWakeLock: () => void,
	disableWakeLock: () => void,
}

const WakeLockContext = createContext<WakeLockContextType>({
	enableWakeLock: () => {},
	disableWakeLock: () => {},
});

export const WakeLockProvider: React.FC<PropsWithChildren> = (props: PropsWithChildren) => {
	const noSleepRef = useRef<NoSleep>();
	if (!noSleepRef.current) {
		noSleepRef.current = new NoSleep();
	}

	// ユーザー操作（開始ボタン押下）のコールバック内から呼ぶ必要がある
	// （iOSではユーザー操作なしのvideo再生・Wake Lock取得が許可されないため）
	function enableWakeLock() {
		noSleepRef.current?.enable().catch(() => {});
	}
	function disableWakeLock() {
		noSleepRef.current?.disable();
	}

	const value: WakeLockContextType = {
		enableWakeLock,
		disableWakeLock,
	};

	return <WakeLockContext.Provider value={value} {...props} />;
}

export const useWakeLock = () => {
	const context = useContext(WakeLockContext);

  if (typeof context === 'undefined') {
    throw new Error('useWakeLock must be within a WakeLockProvider');
  }

  return context;
}
