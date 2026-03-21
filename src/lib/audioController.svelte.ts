import { type Track } from "./types";

/**
 * Clean & Stable AudioController.
 *
 * Focused on:
 * 1. Predictable state management across browsers.
 * 2. Robust widget initialization.
 * 3. Stable track switching.
 */
class AudioController {
	// Reactive State
	isPlaying = $state(false);
	currentTrack = $state<Track | null>(null);
	currentTime = $state(0);
	duration = $state(0);
	isBuffering = $state(false);
	isSeeking = $state(false);

	// Internal Refs
	private scWidget: any = null;
	private scIframe: HTMLIFrameElement | null = null;
	private lastTrackId: string | null = null;

	/**
	 * Initialize with the iframe.
	 * Called from the component once consent is given and the iframe is rendered.
	 */
	setElements(scIframe: HTMLIFrameElement) {
		if (this.scIframe === scIframe) return;
		this.scIframe = scIframe;
		this._initWidget();
	}

	private _initWidget() {
		if (typeof window === "undefined") return;

		const SC = (window as any).SC;
		// If the script isn't loaded yet, we wait.
		// The component handles loading the script after consent.
		if (!SC || !this.scIframe) {
			setTimeout(() => this._initWidget(), 200);
			return;
		}

		if (this.scWidget) return;

		try {
			this.scWidget = SC.Widget(this.scIframe);

			// Bind core events
			this.scWidget.bind(SC.Widget.Events.PLAY, () => {
				this.isPlaying = true;
			});
			this.scWidget.bind(SC.Widget.Events.PAUSE, () => {
				this.isPlaying = false;
			});
			this.scWidget.bind(SC.Widget.Events.FINISH, () => {
				this.isPlaying = false;
				this.currentTime = 0;
			});

			this.scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
				// Don't update state while scrubbing or loading to avoid UI jitter
				if (!this.isSeeking && !this.isBuffering) {
					this.currentTime = data.currentPosition / 1000;
				}
			});

			this.scWidget.bind(SC.Widget.Events.ERROR, () => {
				this.isBuffering = false;
				this.isPlaying = false;
			});
		} catch (e) {
			console.error("Failed to initialize SoundCloud Widget:", e);
		}
	}

	/**
	 * Load and play a track.
	 */
	async play(track: Track) {
		if (this.currentTrack?.id === track.id) {
			this.toggle();
			return;
		}

		this.lastTrackId = track.id;
		this.currentTrack = track;
		this.isBuffering = true;
		this.currentTime = 0;

		// Ensure widget is ready before calling load
		if (!this.scWidget) {
			this._initWidget();
			// wait a bit for initialization
			await new Promise((r) => setTimeout(r, 300));
		}

		if (!this.scWidget) return;

		this.scWidget.load(track.externalUrl, {
			auto_play: true,
			show_artwork: false,
			buying: false,
			sharing: false,
			download: false,
			show_playcount: false,
			callback: () => {
				// Prevent old callbacks from updating state if user switched tracks quickly
				if (this.lastTrackId !== track.id) return;

				this.scWidget.getDuration((d: number) => {
					this.duration = d / 1000;
					this.isBuffering = false;
				});
			},
		});
	}

	/**
	 * Standard toggle.
	 */
	toggle() {
		if (!this.scWidget) return;
		if (this.isPlaying) this.scWidget.pause();
		else this.scWidget.play();
	}

	/**
	 * Seek to time.
	 * @param commit If true, updates the actual widget.
	 */
	seek(time: number, commit = true) {
		this.currentTime = Math.max(0, Math.min(time, this.duration));

		if (commit && this.scWidget) {
			this.scWidget.seekTo(this.currentTime * 1000);
		}
	}

	/**
	 * Stop playback and reset.
	 */
	stop() {
		if (this.scWidget) this.scWidget.pause();
		this.isPlaying = false;
		this.currentTrack = null;
		this.currentTime = 0;
		this.lastTrackId = null;
	}
}

export const audioController = new AudioController();
