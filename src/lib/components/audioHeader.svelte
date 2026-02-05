<script lang="ts">
	import { currentTrack, isPlaying, isDarkMode } from "$lib/stores";
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

		// removed PLAY and PAUSE bindings to avoid loop with $effect

		scWidget.bind(window.SC.Widget.Events.FINISH, () => {
			isPlaying.set(false);
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		scWidget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
			if (!isDragging && $currentTrack?.isExternal) {
				currentTime = data.currentPosition / 1000; // ms to s
			}
		});

		scWidget.bind(window.SC.Widget.Events.Do, () => {
			// "do" seems to be undefined in types usually, but duration change is key
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
			// immediately stop playback to prevent overlap
			isPlaying.set(false);

			// reset state
			currentTime = 0;
			duration = 0;

			if (track.isExternal) {
				// switching TO External (SoundCloud)

				// 1. ensure HTML5 audio is completely stopped
				if (audio) {
					audio.pause();
					audio.currentTime = 0; // reset position
					// we keep src for now to avoid null errors, but pause is key
				}

				// 2. load SoundCloud
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
							// only auto-play if the user initiated this (which they did by clicking a track)
							isPlaying.set(true);
						},
					});
				}
			} else {
				// switching to local file

				// 1. ensure SoundCloud is completely stopped
				if (scWidget) {
					scWidget.pause();
				}

				// 2. load Local File
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
			// we only want to auto-play if this change came from a user selection (new track)
			// the currentTrack subscription sets isPlaying=false initially, so we set it true here
			audio
				.play()
				.then(() => isPlaying.set(true))
				.catch((e) => console.error("Autoplay failed:", e));
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
		if (isNaN(time)) return "00:00";
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = Math.floor(time % 60);

		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}

		return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
		preload="metadata"
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
		class="relative flex w-full items-center overflow-hidden border-b-2 border-[var(--text-color)] bg-[var(--bg-color)] p-4 py-6 md:py-8">
		<!-- Theme Toggle (Top Right) -->
		<button
			class="group absolute top-5 right-4 z-50 cursor-pointer p-2 focus:outline-none md:top-8"
			onclick={() => isDarkMode.update((d) => !d)}
			aria-label="Toggle theme">
			<div
				class="h-6 w-6 bg-[var(--text-color)] group-hover:bg-[var(--highlight-color)]"
				style="
					mask-image: url('data:image/svg+xml;utf8,{$isDarkMode
					? `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 2v2%22/><path d=%22M12 20v2%22/><path d=%22m4.93 4.93 1.41 1.41%22/><path d=%22m17.66 17.66 1.41 1.41%22/><path d=%22M2 12h2%22/><path d=%22M20 12h2%22/><path d=%22m6.34 17.66-1.41 1.41%22/><path d=%22m19.07 4.93-1.41 1.41%22/><circle cx=%2212%22 cy=%2212%22 r=%224%22/></svg>`
					: `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z%22/></svg>`}');
					-webkit-mask-image: url('data:image/svg+xml;utf8,{$isDarkMode
					? `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 2v2%22/><path d=%22M12 20v2%22/><path d=%22m4.93 4.93 1.41 1.41%22/><path d=%22m17.66 17.66 1.41 1.41%22/><path d=%22M2 12h2%22/><path d=%22M20 12h2%22/><path d=%22m6.34 17.66-1.41 1.41%22/><path d=%22m19.07 4.93-1.41 1.41%22/><circle cx=%2212%22 cy=%2212%22 r=%224%22/></svg>`
					: `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z%22/></svg>`}');
					mask-size: contain;
					-webkit-mask-size: contain;
					mask-repeat: no-repeat;
					-webkit-mask-repeat: no-repeat;
					mask-position: center;
					-webkit-mask-position: center;
				">
			</div>
		</button>

		<!-- spinning logo (leftmost) -->
		<button
			onclick={togglePlayback}
			class="flex h-[clamp(112px,21vw,210px)] w-[clamp(112px,21vw,210px)] shrink-0 cursor-pointer items-center justify-center focus:outline-none"
			aria-label={$isPlaying ? "Pause" : "Play"}>
			<div
				class="animate-spin-vinyl h-full w-full"
				style="
					background-color: var(--text-color);
					mask-image: url('/logo_zfk_transparent.png');
					-webkit-mask-image: url('/logo_zfk_transparent.png');
					mask-size: contain;
					-webkit-mask-size: contain;
					mask-repeat: no-repeat;
					-webkit-mask-repeat: no-repeat;
					mask-position: center;
					-webkit-mask-position: center;
					animation-play-state: {$isPlaying ? 'running' : 'paused'};
					will-change: transform;
				">
			</div>
		</button>

		{#if $currentTrack}
			<!-- track info (time + title) to the right of the logo -->
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 flex-col items-start gap-1 pt-2">
				<!-- metadata -->
				<div
					class="flex shrink-0 items-center gap-5 text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums opacity-85">
					<span>{formatTime(currentTime)} / {formatTime(duration)}</span>
					{#if $currentTrack.isExternal && $currentTrack.externalUrl}
						<a
							href={$currentTrack.externalUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="group pointer-events-auto inline-flex items-center"
							style="height: 1em; width: 1.6em; transform: translateY(-0.12em) scale(2);"
							aria-label="Listen on SoundCloud">
							<div
								class="h-full w-full bg-[var(--text-color)] group-hover:bg-[var(--highlight-color)]"
								style="
									mask-image: url('/soundcloud_icon_white_transparent.png');
									-webkit-mask-image: url('/soundcloud_icon_white_transparent.png');
									mask-size: contain;
									-webkit-mask-size: contain;
									mask-repeat: no-repeat;
									-webkit-mask-repeat: no-repeat;
									mask-position: center;
									-webkit-mask-position: center;
								">
							</div>
						</a>
					{/if}
				</div>

				<!-- title -->
				<div class="flex items-center gap-3 text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
					<span>{$currentTrack.title}</span>
				</div>
			</div>
		{:else}
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 items-center">
				<!-- title, centered vertically -->
				<div class="text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
					Zentrum für <br />
					Kollektivkultur e.V.
				</div>
			</div>
		{/if}

		<!-- seekable progress bar area -->
		<div
			class="absolute right-0 bottom-0 left-0 h-[15px] cursor-pointer touch-none"
			bind:this={progressBar}
			role="button"
			tabindex="0"
			aria-label="Seek"
			onmousedown={onDragStart}
			ontouchstart={onDragStart}>
			<!-- playhead -->
			<div
				class="absolute bottom-0 z-20 flex h-[12px] w-[40px] items-center justify-center bg-[var(--text-color)] text-[10px] font-bold text-[var(--bg-color)] md:w-[60px] md:text-sm"
				style="left: {duration ? (currentTime / duration) * 100 : 0}%; transform: translateX(-{duration
					? (currentTime / duration) * 100
					: 0}%); opacity: {$currentTrack ? 1 : 0};">
				| | |
			</div>
			<!-- progress bar (inverse hue) -->
			<div
				class="pointer-events-none absolute bottom-0 left-0 z-10 h-[12px]"
				style="width: {duration ? (currentTime / duration) * 100 : 0}%; transition: {isDragging
					? 'none'
					: 'width 0.1s linear'};">
				<div class="h-full w-full" style="background-color: var(--highlight-color);"></div>
			</div>
		</div>
	</div>
</div>
