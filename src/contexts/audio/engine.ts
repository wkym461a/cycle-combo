import soundChime from '~/assets/sound-chime.mp3';
import soundBeep from '~/assets/sound-beep.mp3';
import soundBell from '~/assets/sound-bell.mp3';
import keepAliveSrc from '~/assets/keep-alive.wav';

export const SOUND_TYPES = ['chime', 'beep', 'bell'] as const;
export type SoundType = typeof SOUND_TYPES[number];

export const SOUND_TYPE_LABELS: Record<SoundType, string> = {
	chime: 'チャイム',
	beep: 'ビープ',
	bell: 'ベル',
};

const SOUND_SOURCES: Record<SoundType, string> = {
	chime: soundChime,
	beep: soundBeep,
	bell: soundBell,
};

export const MIN_VOLUME = 0.5;
export const MAX_VOLUME = 3;
export const DEFAULT_VOLUME = 1.5;

export function isSoundType(value: unknown): value is SoundType {
	return typeof value === 'string' && (SOUND_TYPES as readonly string[]).includes(value);
}

export function clampVolume(volume: number): number {
	return Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, volume));
}

type Listener = () => void;

/**
 * タイマー音の再生エンジン。React の外側で AudioContext と <audio> を管理する。
 *
 * - 実際の音は Web Audio（AudioBufferSourceNode → GainNode → DynamicsCompressor）で鳴らす。
 *   GainNode により 100% を超える音量ブーストができる（<audio> の volume は iOS では無視される）。
 * - iOS では Web Audio の出力が消音スイッチ（マナーモード）で消されるが、
 *   HTMLMediaElement が再生中だとオーディオセッションが「再生」扱いになり Web Audio も鳴る。
 *   そこでほぼ無音の短い音を <audio> でループ再生し続ける（keep-alive）。
 *   これは unmute.js 等で使われている手法で、副次的に iOS がページを
 *   バックグラウンドでも動かし続けやすくなる（音楽アプリの再生は止まる）。
 * - 着信・Siri・他アプリの音声・バックグラウンド移行で AudioContext が止まることがあるため、
 *   前面に戻ったときと状態変化時に resume を試みる。
 */
export class AudioEngine {
	private readonly ctx: AudioContext;
	private readonly gain: GainNode;
	private readonly buffers: Partial<Record<SoundType, AudioBuffer>> = {};
	private current: AudioBufferSourceNode | null = null;
	private readonly keepAlive: HTMLAudioElement;
	private keepAliveWanted = false;
	private readonly listeners = new Set<Listener>();

	constructor(volume: number) {
		type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
		const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
		if (!Ctor) {
			throw new Error('Web Audio API is not supported');
		}
		this.ctx = new Ctor();

		this.gain = this.ctx.createGain();
		this.gain.gain.value = clampVolume(volume);
		const compressor = this.ctx.createDynamicsCompressor();  // ブースト時のクリッピングを抑える
		this.gain.connect(compressor);
		compressor.connect(this.ctx.destination);

		this.keepAlive = new Audio(keepAliveSrc);
		this.keepAlive.loop = true;
		this.keepAlive.preload = 'auto';
		this.keepAlive.setAttribute('playsinline', '');

		this.ctx.addEventListener('statechange', this.handleStateChange);
		document.addEventListener('visibilitychange', this.handleVisibilityChange);
	}

	/** 音が鳴らせる状態か（ユーザー操作で unlock 済みで、中断されていない） */
	get isRunning(): boolean {
		return this.ctx.state === 'running';
	}

	get isKeepAliveActive(): boolean {
		return this.keepAliveWanted;
	}

	subscribe(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => { this.listeners.delete(listener); };
	}

	private notify() {
		this.listeners.forEach(listener => listener());
	}

	private handleStateChange = () => {
		this.notify();
	};

	private handleVisibilityChange = () => {
		if (document.visibilityState === 'visible') {
			void this.recover();
		}
	};

	/** 中断後の復帰を試みる（ユーザー操作の文脈でなくても成功することがある） */
	async recover(): Promise<void> {
		if (this.ctx.state !== 'running') {
			try { await this.ctx.resume(); } catch { /* 操作待ち */ }
		}
		if (this.keepAliveWanted && this.keepAlive.paused) {
			this.keepAlive.play().catch(() => {});
		}
		this.notify();
	}

	/** 音源をデコードする。失敗した音源は無音になるが、他の音源は使える。 */
	async load(): Promise<void> {
		await Promise.all(SOUND_TYPES.map(async (type) => {
			try {
				const response = await fetch(SOUND_SOURCES[type]);
				const data = await response.arrayBuffer();
				this.buffers[type] = await this.ctx.decodeAudioData(data);
			} catch (error) {
				console.error(`AudioEngine: failed to load sound "${type}"`, error);
			}
		}));
	}

	/** ユーザー操作（タップ）のコールバック内から呼ぶこと */
	async unlock(): Promise<void> {
		try { await this.ctx.resume(); } catch { /* 非対応環境 */ }
		this.notify();
	}

	/** ユーザー操作の文脈で呼ぶこと。stopKeepAlive まで無音ループを維持する。 */
	startKeepAlive(): void {
		this.keepAliveWanted = true;
		this.keepAlive.play().catch(() => {});
	}

	stopKeepAlive(): void {
		this.keepAliveWanted = false;
		this.keepAlive.pause();
		try { this.keepAlive.currentTime = 0; } catch { /* 未ロード時 */ }
	}

	/** 再生を開始できたら true（音源が未ロードなら false） */
	play(type: SoundType): boolean {
		const buffer = this.buffers[type];
		if (!buffer) return false;

		this.stop();
		const source = this.ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(this.gain);
		source.onended = () => {
			source.disconnect();
			if (this.current === source) this.current = null;
		};
		source.start();
		this.current = source;
		return true;
	}

	stop(): void {
		if (!this.current) return;
		try { this.current.stop(); } catch { /* 既に停止済み */ }
		this.current.disconnect();
		this.current = null;
	}

	setVolume(volume: number): void {
		this.gain.gain.value = clampVolume(volume);
	}

	dispose(): void {
		this.ctx.removeEventListener('statechange', this.handleStateChange);
		document.removeEventListener('visibilitychange', this.handleVisibilityChange);
		this.stop();
		this.stopKeepAlive();
		this.listeners.clear();
		this.ctx.close().catch(() => {});
	}
}
