import { type Track } from "./types";

class AudioController {
	// Reactive state
	isPlaying = $state(false);
	currentTrack = $state<Track | null>(null);
	currentTime = $state(0);
	duration = $state(0);
	isBuffering = $state(false);

	// Internal references
	private audio: HTMLAudioElement | null = null;
	private scIframe: HTMLIFrameElement | null = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private scWidget: any | null = null;

	// Constants
	private readonly SC_POLL_INTERVAL = 500;

	/**
	 * Initialize the controller with DOM elements.
	 * Must be called in onMount.
	 */
	setElements(audio: HTMLAudioElement, scIframe: HTMLIFrameElement) {
		this.audio = audio;
		this.scIframe = scIframe;

		this._setupLocalAudio();
		this._initScWidget();
	}

	/**
	 * Play a track.
	 * If the track is already current, toggle playback.
	 * If it's a new track, stop the current one and start the new one.
	 */
	async play(track: Track) {
		if (this.currentTrack?.id === track.id) {
			this.toggle();
			return;
		}

		// Stop previous track properly
		this.stop();

		this.currentTrack = track;
		this.currentTime = 0;
		this.duration = 0;
		this.isBuffering = true;

		if (track.isExternal) {
			await this._playExternal(track);
		} else {
			await this._playLocal(track);
		}
	}

	/**
	 * Toggle play/pause for the current track.
	 */
	toggle() {
		if (!this.currentTrack) return;

		if (this.isPlaying) {
			this.pause();
		} else {
			this.resume();
		}
	}

	/**
	 * Pause playback.
	 */
	pause() {
		if (this.currentTrack?.isExternal) {
			this.scWidget?.pause();
		} else {
			this.audio?.pause();
		}
		// State updates are handled by event listeners
	}

	/**
	 * Resume playback.
	 */
	resume() {
		if (this.currentTrack?.isExternal) {
			this.scWidget?.play();
		} else {
			this.audio?.play().catch((e) => console.error("Resume failed:", e));
		}
		// State updates are handled by event listeners
	}

	/**
	 * Stop playback and reset state.
	 */
	stop() {
		if (this.audio) {
			this.audio.pause();
			this.audio.currentTime = 0;
			// Don't nuke src immediately if not needed, but can help
			this.audio.removeAttribute("src");
			this.audio.load();
		}

		if (this.scWidget) {
			this.scWidget.pause();
		}

		this.isPlaying = false;
		this.isBuffering = false;
	}

	/**
	 * Seek to a specific time (in seconds).
	 */
	seek(time: number) {
		if (!this.currentTrack) return;

		// Clamp time
		time = Math.max(0, Math.min(time, this.duration));

		if (this.currentTrack.isExternal) {
			this.scWidget?.seekTo(time * 1000);
			// SC widget events will update currentTime
		} else {
			if (this.audio) {
				this.audio.currentTime = time;
				// Immediate update for UI responsiveness
				this.currentTime = time;
			}
		}
	}

	// --- Internal Methods ---

	private _setupLocalAudio() {
		if (!this.audio) return;

		this.audio.onplay = () => {
			if (!this.currentTrack?.isExternal) {
				this.isPlaying = true;
				this.isBuffering = false;
			}
		};

		this.audio.onpause = () => {
			if (!this.currentTrack?.isExternal) {
				this.isPlaying = false;
			}
		};

		this.audio.onended = () => {
			if (!this.currentTrack?.isExternal) {
				this.isPlaying = false;
				this.currentTime = 0;
			}
		};

		this.audio.ontimeupdate = () => {
			if (this.audio && !this.currentTrack?.isExternal && !this.audio.seeking) {
				this.currentTime = this.audio.currentTime;
			}
		};

		this.audio.onloadedmetadata = () => {
			if (this.audio && !this.currentTrack?.isExternal) {
				this.duration = this.audio.duration;
				this.isBuffering = false;
			}
		};

		this.audio.onwaiting = () => {
			if (!this.currentTrack?.isExternal) {
				this.isBuffering = true;
			}
		};

		this.audio.onplaying = () => {
			if (!this.currentTrack?.isExternal) {
				this.isBuffering = false;
			}
		};

		this.audio.onerror = (e) => {
			console.error("Audio Error:", e);
			if (!this.currentTrack?.isExternal) {
				this.isPlaying = false;
				this.isBuffering = false;
			}
		};
	}

	private _initScWidget() {
		if (typeof window === "undefined") return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SC = (window as any).SC;

		if (this.scIframe && SC) {
			// Check if widget is already initialized on this iframe
			if (!this.scWidget) {
				this.scWidget = SC.Widget(this.scIframe);
				this._bindScEvents();
			}
		} else {
			// Retry loop
			const timer = setInterval(() => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const SC = (window as any).SC;
				if (SC && this.scIframe) {
					if (!this.scWidget) {
						this.scWidget = SC.Widget(this.scIframe);
						this._bindScEvents();
					}
					clearInterval(timer);
				}
			}, this.SC_POLL_INTERVAL);
		}
	}

	private _bindScEvents() {
		if (!this.scWidget) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const SC = (window as any).SC;

		this.scWidget.bind(SC.Widget.Events.PLAY, () => {
			if (this.currentTrack?.isExternal) {
				this.isPlaying = true;
				this.isBuffering = false;
			}
		});

		this.scWidget.bind(SC.Widget.Events.PAUSE, () => {
			if (this.currentTrack?.isExternal) {
				this.isPlaying = false;
			}
		});

		this.scWidget.bind(SC.Widget.Events.FINISH, () => {
			if (this.currentTrack?.isExternal) {
				this.isPlaying = false;
				this.currentTime = 0;
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
			if (this.currentTrack?.isExternal) {
				this.currentTime = data.currentPosition / 1000;
			}
		});

		this.scWidget.bind(SC.Widget.Events.READY, () => {
			// Ready
		});

		this.scWidget.bind(SC.Widget.Events.ERROR, () => {
			this.isBuffering = false;
			this.isPlaying = false;
		});
	}

	private async _playLocal(track: Track) {
		if (!this.audio) return;

		try {
			this.audio.src = track.filePath;
			this.audio.load();

			const p = this.audio.play();
			if (p !== undefined) {
				await p;
			}
		} catch (e) {
			console.error("Local play failed:", e);
			this.isBuffering = false;
			this.isPlaying = false;
		}
	}

	private async _playExternal(track: Track) {
		if (!this.scWidget || !track.externalUrl) {
			this.isBuffering = false;
			return;
		}

		// Re-bind events because widget instance might change behavior on load
		this._bindScEvents();

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
				this.isBuffering = false;

				// Force play if auto_play fails (mobile fallback attempt)
				this.scWidget.isPaused((paused: boolean) => {
					if (paused) {
						this.scWidget.play();
					}
				});
			},
		});
	}
}

export const audioController = new AudioController();
