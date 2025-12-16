<script lang="ts">
	import { currentTrack, isPlaying } from "$lib/playerStore";
	import type { Track } from "$lib/types";
	import { onMount } from "svelte";

	let { audioFiles = [] } = $props();

	let audio: HTMLAudioElement | undefined = $state();
	let scIframe: HTMLIFrameElement | undefined = $state();
	// eslint-disable-next-line no-undef
	let scWidget: SoundCloudWidget | undefined = $state(); // SC.Widget instance

	let currentTime = $state(0);
	let duration = $state(0);
	let src = $state("");

	let isDragging = $state(false);
	let progressBar: HTMLDivElement | undefined = $state();

	// helper to load SC Widget API if not present (handled by svelte:head, but good to check)
	// we rely on window.SC from the script tag

	onMount(() => {
		// initialize SC Widget if iframe exists
		if (scIframe && window.SC) {
			scWidget = window.SC.Widget(scIframe);
			setupScEvents();
		} else {
			// poll for SC API availability just in case
			const interval = setInterval(() => {
				if (window.SC && scIframe) {
					scWidget = window.SC.Widget(scIframe);
					setupScEvents();
					clearInterval(interval);
				}
			}, 100);
		}
	});

	function setupScEvents() {
		if (!scWidget) return;

		scWidget.bind(window.SC.Widget.Events.READY, () => {
			// console.log("SC Widget Ready");
		});

		// Removed PLAY and PAUSE bindings to avoid loop with $effect

		scWidget.bind(window.SC.Widget.Events.FINISH, () => {
			isPlaying.set(false);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		scWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
			if (!isDragging) {
				currentTime = data.currentPosition / 1000; // ms to s
			}
		});

		scWidget.bind(window.SC.Widget.Events.Do, () => {
			// "Do" seems to be undefined in types usually, but Duration change is key
			// some docs say READY gives duration, or load callback
		});

		// also bind to ready/load to get duration
	}

	// helper to safely call SC widget methods that might return rejected promises on abort
	function safeWidgetAction(action: "play" | "pause") {
		if (!scWidget) return;
		try {
			const result = action === "play" ? scWidget.play() : scWidget.pause();
			// check if it returned a promise
			if (result && typeof result.then === "function") {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				result.catch((e: any) => {
					// ignore AbortError which happens when toggling fast
					if (e?.name !== "AbortError") {
						console.warn("SC Widget Error:", e);
					}
				});
			}
		} catch (e) {
			console.warn("SC Widget Exception:", e);
		}
	}

	// sync $isPlaying store to audio element state
	$effect(() => {
		if ($currentTrack?.isExternal) {
			// handle SoundCloud
			if (scWidget) {
				if ($isPlaying) {
					safeWidgetAction("play");
				} else {
					safeWidgetAction("pause");
				}
			}
			return;
		}

		// handle HTML5 audio
		if (!audio) return;
		if ($isPlaying && audio.paused) {
			audio.play().catch((e) => console.error("Play failed:", e));
		} else if (!$isPlaying && !audio.paused) {
			audio.pause();
		}
	});

	// update audio source when current track changes
	currentTrack.subscribe((track: Track | null) => {
		if (track) {
			// reset state
			currentTime = 0;
			duration = 0;
			isPlaying.set(false);

			if (track.isExternal) {
				// handle SoundCloud
				if (audio) {
					audio.pause();
					audio.src = ""; // stop HTML5 download
				}
				if (scWidget) {
					scWidget.load(track.externalUrl || "", {
						auto_play: true,
						show_artwork: false,
						buying: false, // hide buy button
						sharing: false,
						download: false,
						show_playcount: false,
						callback: () => {
							scWidget?.getDuration((d: number) => {
								duration = d / 1000; // ms to s
							});
							isPlaying.set(true);
						},
					});
				}
			} else {
				// handle local file
				if (scWidget) {
					scWidget.pause();
				}
				src = track.filePath;
				// HTML5 audio "autoplay" handled by the effect below or onloadedmetadata
			}
		}
	});

	// autoplay when src changes or audio element becomes available (HTML5 ONLY)
	$effect(() => {
		if ($currentTrack?.isExternal) return;
		if (audio && src) {
			audio.load();
			audio.play().catch((e) => console.error("Autoplay failed:", e));
			isPlaying.set(true);
		}
	});

	// pick a random track from the list and play it
	async function randomizeAndPlay() {
		if (audioFiles && audioFiles.length > 0) {
			const randomIndex = Math.floor(Math.random() * audioFiles.length);
			const randomTrack = audioFiles[randomIndex];
			currentTrack.set(randomTrack);
		}
	}

	// toggle play/pause state or start random track if none selected
	function togglePlayback(event: MouseEvent) {
		event.stopPropagation(); // prevent seeking when clicking play button
		if ($currentTrack) {
			isPlaying.update((p) => !p);
		} else {
			randomizeAndPlay();
		}
	}

	// update current time based on click/drag position
	function updateTime(clientX: number) {
		if (!progressBar || !duration) return;
		if (!$currentTrack) return;

		const rect = progressBar.getBoundingClientRect();
		const x = clientX - rect.left;
		const width = rect.width;
		const ratio = Math.max(0, Math.min(1, x / width));
		const newTime = ratio * duration;

		if ($currentTrack.isExternal) {
			if (scWidget) {
				scWidget.seekTo(newTime * 1000); // s to ms
			}
		} else {
			if (audio) audio.currentTime = newTime;
		}
		currentTime = newTime;
	}

	// start dragging the progress bar
	function onDragStart(event: MouseEvent | TouchEvent) {
		if (!$currentTrack) return;

		// ensure playing
		if ($currentTrack.isExternal) {
			if (scWidget) scWidget.play();
		} else {
			if (audio && audio.paused) isPlaying.set(true);
		}

		isDragging = true;

		const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
		updateTime(clientX);

		window.addEventListener("mousemove", onDragMove);
		window.addEventListener("touchmove", onDragMove, { passive: false });
		window.addEventListener("mouseup", onDragEnd);
		window.addEventListener("touchend", onDragEnd);
	}

	// handle dragging movement
	function onDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		if (event.cancelable) {
			event.preventDefault();
		}

		const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
		updateTime(clientX);
	}

	// stop dragging
	function onDragEnd() {
		isDragging = false;
		window.removeEventListener("mousemove", onDragMove);
		window.removeEventListener("touchmove", onDragMove);
		window.removeEventListener("mouseup", onDragEnd);
		window.removeEventListener("touchend", onDragEnd);
	}

	// helper to format seconds into mm:ss or hh:mm:ss
	const formatTime = (time: number) => {
		if (isNaN(time)) return "0:00";
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = Math.floor(time % 60);

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	};
</script>

<svelte:head>
	<script src="https://w.soundcloud.com/player/api.js"></script>
</svelte:head>

<div class="flex w-full flex-col">
	<!-- HTML5 Audio -->
	<audio
		bind:this={audio}
		bind:duration
		bind:currentTime
		onplay={() => isPlaying.set(true)}
		onpause={() => isPlaying.set(false)}
		onloadedmetadata={() => {
			if (!$currentTrack?.isExternal) duration = (audio as HTMLAudioElement).duration;
		}}
		{src}
		class="hidden">
	</audio>

	<!-- SoundCloud Widget Iframe (hidden) -->
	<iframe
		bind:this={scIframe}
		id="sc-widget"
		width="100%"
		height="166"
		scrolling="no"
		frameborder="no"
		allow="autoplay; encrypted-media"
		src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&show_artwork=false"
		class="hidden"
		title="SoundCloud Player">
	</iframe>

	<!-- audio header: spinning logo + track info + progress bar -->
	<div
		class="relative flex w-full items-center overflow-hidden border-b-2 border-[var(--text-color)] bg-[var(--bg-color)] p-4">
		<!-- spinning logo (leftmost) -->
		<button
			onclick={togglePlayback}
			class="flex h-[80px] w-[80px] shrink-0 cursor-pointer items-center justify-center focus:outline-none md:h-[120px] md:w-[120px] lg:h-[150px] lg:w-[150px]"
			aria-label={$isPlaying ? "Pause" : "Play"}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 384 384"
				class="animate-spin-vinyl h-full w-full text-[var(--text-color)] drop-shadow-[var(--text-glow)]"
				style="animation-play-state: {$isPlaying ? 'running' : 'paused'}; fill: currentColor">
				<path
					d="M247.73,272.38l53.76-56.76h36.76l-71.95,71.78,49.69,51.19c41.6-35.22,68.02-87.82,68.02-146.59s-28.17-114.8-72.14-149.99l-18.99,4.04c-12.07,1.98-16.48,7.34-16.48,17.67v125.99h-26.57v-100.12h-17.96v-16.47l17.96-5.67c.02-30.16,8.15-39.31,31.8-45.28C254.86,8.02,224.37,0,192,0c-38.11,0-73.62,11.1-103.49,30.25h47.4l-19.76,22.31h-56.12C23.06,87.55,0,137.08,0,192c0,50.86,19.78,97.09,52.06,131.44v-107.82h26.99v131.64c31.7,23.1,70.73,36.74,112.95,36.74,38.1,0,73.6-11.1,103.46-30.23l-47.8-50.49.06-30.9ZM297.63,68.06h26.31v22.14h-26.31v-22.14ZM192.46,189.72h-125.81v-20.7L172.33,37.48l16.69-.19v19.02l-89.24,109.25v1.84h92.69v22.31Z" />
			</svg>
		</button>

		{#if $currentTrack}
			<!-- track info (time + title) to the right of the logo -->
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 flex-col items-start gap-1 pt-2">
				<!-- time -->
				<div class="shrink-0 text-base tabular-nums opacity-70 md:text-xl">
					{formatTime(currentTime)} / {formatTime(duration)}
				</div>

				<!-- title -->
				<div class="text-lg font-medium md:text-2xl">
					{$currentTrack.title}
				</div>
			</div>
		{:else}
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 items-center">
				<!-- title, centered vertically -->
				<div class="text-lg font-medium md:text-2xl">
					Zentrum für <br />
					Kollektivkultur e.V.
				</div>
			</div>
		{/if}

		<!-- seekable progress bar area -->
		<div
			class="absolute right-0 bottom-0 left-0 h-[12px] cursor-pointer"
			bind:this={progressBar}
			role="button"
			tabindex="0"
			aria-label="Seek"
			onmousedown={onDragStart}
			ontouchstart={onDragStart}>
			<!-- playhead -->
			<div
				class="absolute bottom-0 z-20 flex h-[15px] w-[60px] items-center justify-center bg-[var(--text-color)] font-bold text-[var(--bg-color)]"
				style="left: {duration ? (currentTime / duration) * 100 : 0}%; transform: translateX(-{duration
					? (currentTime / duration) * 100
					: 0}%); opacity: {$currentTrack ? 1 : 0};">
				| | |
			</div>
			<!-- progress bar (gradient from bottom) -->
			<div
				class="pointer-events-none absolute bottom-0 left-0 z-10 h-[15px] overflow-hidden"
				style="width: {duration ? (currentTime / duration) * 100 : 0}%; transition: {isDragging
					? 'none'
					: 'width 0.1s linear'};">
				<div
					class="h-full w-screen"
					style="background-image: linear-gradient(270deg, #ff00ff, #ffc000, #ccff00, #00ffff, #0080ff, #8000ff, #ff00ff); background-size: 100% 100%; animation: var(--animate-rainbow); mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);">
				</div>
			</div>
		</div>
	</div>
</div>
