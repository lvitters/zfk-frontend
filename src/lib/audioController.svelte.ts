import { type Track } from "./types";

class AudioController {
	// reactive state
	isPlaying = $state(false);
	currentTrack = $state<Track | null>(null);
	currentTime = $state(0);
	duration = $state(0);

	// internal references
	private audio: HTMLAudioElement | null = null;
	private scIframe: HTMLIFrameElement | null = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private scWidget: any | null = null;

	private ignoreScEvents = false;
	private scLockDuration = 500;

	// bind DOM elements
	setElements(audio: HTMLAudioElement, scIframe: HTMLIFrameElement) {
		this.audio = audio;
		this.scIframe = scIframe;

		// setup HTML5 audio listeners
		if (this.audio) {
			this.audio.onplay = () => (this.isPlaying = true);
			this.audio.onpause = () => (this.isPlaying = false);
			this.audio.onended = () => (this.isPlaying = false);
			this.audio.ontimeupdate = () => {
				if (this.audio && !this.currentTrack?.isExternal) {
					this.currentTime = this.audio.currentTime;
				}
			};
			this.audio.onloadedmetadata = () => {
				if (this.audio && !this.currentTrack?.isExternal) {
					this.duration = this.audio.duration;
				}
			};
		}

		// init SC widget if possible
		this.initScWidget();
	}

	// initialize SoundCloud widget
	private initScWidget() {
		if (typeof window === "undefined") return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SC = (window as any).SC;

		if (this.scIframe && SC) {
			this.scWidget = SC.Widget(this.scIframe);
			this.setupScEvents();
		} else {
			// retry if SC not ready
			const interval = setInterval(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const SC = (window as any).SC;
				if (SC && this.scIframe) {
					this.scWidget = SC.Widget(this.scIframe);
					this.setupScEvents();
					clearInterval(interval);
				}
			}, 500);
		}
	}

	private setupScEvents() {
		if (!this.scWidget) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SC = (window as any).SC;

		this.scWidget.bind(SC.Widget.Events.PLAY, () => {
			if (!this.ignoreScEvents) this.isPlaying = true;
		});

		this.scWidget.bind(SC.Widget.Events.PAUSE, () => {
			if (!this.ignoreScEvents) this.isPlaying = false;
		});

		this.scWidget.bind(SC.Widget.Events.FINISH, () => {
			this.isPlaying = false;
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
			if (this.currentTrack?.isExternal) {
				this.currentTime = data.currentPosition / 1000; // ms to s
			}
		});

		this.scWidget.bind(SC.Widget.Events.READY, () => {
			// console.log("SC Widget Ready");
		});
	}

	// play a specific track
	async play(track: Track) {
		// if playing same track, just toggle
		if (this.currentTrack?.id === track.id) {
			this.toggle();
			return;
		}

		// stop previous
		this.stopAll();

		this.currentTrack = track;
		this.currentTime = 0;
		this.duration = 0;

		if (track.isExternal) {
			await this.playExternal(track);
		} else {
			await this.playLocal(track);
		}
	}

	// toggle play/pause
	toggle() {
		if (!this.currentTrack) return;

		if (this.isPlaying) {
			this.pause();
		} else {
			this.resume();
		}
	}

	// pause current playback
	pause() {
		this.isPlaying = false;
		if (this.currentTrack?.isExternal) {
			this.safeWidgetAction("pause");
		} else {
			this.audio?.pause();
		}
	}

	// resume playback
	resume() {
		this.isPlaying = true;
		if (this.currentTrack?.isExternal) {
			this.safeWidgetAction("play");
		} else {
			this.audio?.play().catch((e) => console.error("Play failed:", e));
		}
	}

	// seek to time (seconds)
	seek(time: number) {
		this.currentTime = time;
		if (this.currentTrack?.isExternal) {
			this.scWidget?.seekTo(time * 1000); // s to ms
		} else {
			if (this.audio) this.audio.currentTime = time;
		}
	}

	// stop everything and clear sources
	private stopAll() {
		this.isPlaying = false;

		// stop local audio
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
			// clear src to stop network activity
			this.audio.removeAttribute("src");
			this.audio.load();
		}

		// stop SC widget
		if (this.scWidget) {
			this.scWidget.pause();
			// we can't easily "unload" the iframe content without reloading it
			// but pausing is usually enough for the widget api
		}
	}

	private async playLocal(track: Track) {
		if (!this.audio) return;
		this.audio.src = track.filePath;
		this.audio.load();
		try {
			await this.audio.play();
			this.isPlaying = true;
		} catch (e) {
			console.error("Autoplay local failed:", e);
		}
	}

	private async playExternal(track: Track) {
		if (!this.scWidget || !track.externalUrl) return;

		this.ignoreScEvents = true;
		setTimeout(() => (this.ignoreScEvents = false), this.scLockDuration);

		this.scWidget.load(track.externalUrl, {
			auto_play: true,
			show_artwork: false,
			buying: false,
			sharing: false,
			download: false,
			show_playcount: false,
			callback: () => {
				this.scWidget.getDuration((d: number) => {
					this.duration = d / 1000;
				});
				this.isPlaying = true;
			},
		});
	}

	private safeWidgetAction(action: "play" | "pause") {
		if (!this.scWidget) return;
		try {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			action === "play" ? this.scWidget.play() : this.scWidget.pause();
		} catch (e) {
			console.error("SC Widget Action failed:", e);
		}
	}
}

export const audioController = new AudioController();
