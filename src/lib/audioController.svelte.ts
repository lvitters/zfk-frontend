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
		this.scWidget = null; // Clear old widget to force initialization on the new iframe
		this._initWidget();
	}

	private _initWidget() {
		if (typeof window === "undefined") return;

		const SC = (window as any).SC;
		// If the script isn't loaded yet, we don't schedule a timeout retry here;
		// we let the dynamic _waitForWidget helper handle polling when a user tries to play.
		if (!SC || !this.scIframe) {
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

	private async _waitForWidget(timeoutMs = 5000): Promise<boolean> {
		const start = Date.now();
		while (!this.scWidget) {
			this._initWidget();
			if (this.scWidget) return true;
			if (Date.now() - start > timeoutMs) {
				return false;
			}
			await new Promise((r) => setTimeout(r, 100));
		}
		return true;
	}

	/**
	 * Load and play a track.
	 */
	play(track: Track) {
		if (this.currentTrack?.id === track.id) {
			this.toggle();
			return;
		}

		this.lastTrackId = track.id;
		this.currentTrack = track;
		this.isBuffering = true;
		this.isPlaying = false; // Reset play state so UI updates immediately and doesn't get stuck
		this.currentTime = 0;
		this.duration = 0;

		if (this.scWidget) {
			this._loadTrack(track);
		} else {
			this._waitForWidget().then((ready) => {
				if (!ready || !this.scWidget) {
					console.error("SoundCloud widget is not ready.");
					this.isBuffering = false;
					return;
				}
				this._loadTrack(track);
			});
		}
	}

	private _loadTrack(track: Track) {
		// We set auto_play: true to trigger immediate playback. Since this load() call
		// is executed inside the user's click handler (if widget is ready), desktop browsers
		// and most mobile browsers will respect the gesture and play automatically.
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

				// In case auto_play didn't trigger, attempt a play call.
				this.scWidget.play();
			},
		});
	}

	/**
	 * Standard toggle.
	 */
	toggle() {
		if (!this.scWidget) return;
		if (this.isPlaying) {
			this.scWidget.pause();
			this.isPlaying = false; // Update local state synchronously for instant UI response
		} else {
			this.scWidget.play();
			this.isPlaying = true; // Update local state synchronously for instant UI response
		}
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
		if (this.scWidget) {
			try {
				this.scWidget.pause();
			} catch (e) {}
		}
		this.isPlaying = false;
		this.currentTrack = null;
		this.currentTime = 0;
		this.lastTrackId = null;
	}
}

export const audioController = new AudioController();
