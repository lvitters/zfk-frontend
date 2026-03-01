<script lang="ts">
	import { audioController } from "$lib/audioController.svelte";
	import { isDarkMode } from "$lib/stores";
	import { onMount } from "svelte";

	let { audioFiles = [] } = $props();

	let audioEl: HTMLAudioElement | undefined = $state();
	let scIframeEl: HTMLIFrameElement | undefined = $state();

	let isDragging = $state(false);
	let hasBeenActivated = $state(false);
	let progressBar: HTMLDivElement | undefined = $state();

	// monitor track/playback to mark as activated
	$effect(() => {
		if (audioController.currentTrack || audioController.isPlaying) {
			hasBeenActivated = true;
		}
	});

	onMount(() => {
		if (audioEl && scIframeEl) {
			audioController.setElements(audioEl, scIframeEl);
		}
	});

	// pick a random track from the list and play it
	function randomizeAndPlay() {
		if (audioFiles && audioFiles.length > 0) {
			const randomIndex = Math.floor(Math.random() * audioFiles.length);
			const randomTrack = audioFiles[randomIndex];
			audioController.play(randomTrack);
		}
	}

	// toggle play/pause state or start random track if none selected
	function togglePlayback(event: MouseEvent) {
		event.stopPropagation(); // prevent seeking when clicking play button
		if (audioController.currentTrack) {
			audioController.toggle();
		} else {
			randomizeAndPlay();
		}
	}

	// update current time based on click/drag position
	function updateTime(clientX: number) {
		if (!progressBar || !audioController.duration) return;
		if (!audioController.currentTrack) return;

		const rect = progressBar.getBoundingClientRect();
		const x = clientX - rect.left;
		const width = rect.width;
		const ratio = Math.max(0, Math.min(1, x / width));
		const newTime = ratio * audioController.duration;

		// update controller immediately for responsive UI during drag?
		// usually better to just seek on end, or seek continuously.
		// controller's seek updates the actual audio, which updates currentTime via events.
		// to make dragging smooth, we might want to override the displayed time locally.
		// but for now let's just seek.
		audioController.seek(newTime);
	}

	// start dragging the progress bar
	function onDragStart(event: MouseEvent | TouchEvent) {
		if (!audioController.currentTrack) return;

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
	<!-- HTML5 Audio (hidden but active) -->
	<audio bind:this={audioEl} preload="metadata" style="display: none;"></audio>

	<!-- SoundCloud Widget Iframe (hidden but active) -->
	<iframe
		bind:this={scIframeEl}
		id="sc-widget"
		width="10"
		height="10"
		scrolling="no"
		frameborder="no"
		allow="autoplay; encrypted-media"
		src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&show_artwork=false"
		style="position: absolute; left: -9999px; top: 0; opacity: 0; pointer-events: none;"
		title="SoundCloud Player">
	</iframe>

	<!-- audio header: spinning logo + track info + progress bar -->
	<div
		class="relative flex w-full items-center overflow-hidden border-b-2 border-(--text-color) bg-(--bg-color) p-4 py-6 md:py-8">
		<!-- theme toggle (top right) -->
		<button
			class="group absolute top-5 right-4 z-50 cursor-pointer p-2 focus:outline-none md:top-8"
			onclick={() => isDarkMode.update((d) => !d)}
			aria-label="Toggle theme">
			<div
				class="h-6 w-6 bg-(--text-color) group-hover:bg-(--highlight-color) group-active:bg-(--highlight-color)"
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
			class="group flex h-[clamp(112px,21vw,210px)] w-[clamp(112px,21vw,210px)] shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none"
			aria-label={audioController.isPlaying ? "Pause" : "Play"}>
			<div
				class="animate-spin-vinyl h-full w-full {hasBeenActivated
					? 'bg-(--text-color)'
					: 'bg-(--highlight-color)'} group-hover:bg-(--highlight-color) group-active:bg-(--highlight-color)"
				style="
					mask-image: url('/logo_zfk_transparent.png');
					-webkit-mask-image: url('/logo_zfk_transparent.png');
					mask-size: contain;
					-webkit-mask-size: contain;
					mask-repeat: no-repeat;
					-webkit-mask-repeat: no-repeat;
					mask-position: center;
					-webkit-mask-position: center;
					animation-play-state: {audioController.isPlaying ? 'running' : 'paused'};
					will-change: transform;
				">
			</div>
		</button>

		{#if audioController.currentTrack}
			<!-- track info (time + title) to the right of the logo -->
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 flex-col items-start gap-1 pt-2">
				<!-- metadata -->
				<div
					class="flex shrink-0 items-center gap-5 text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums opacity-85">
					<span>{formatTime(audioController.currentTime)} / {formatTime(audioController.duration)}</span>
					{#if audioController.currentTrack.isExternal && audioController.currentTrack.externalUrl}
						<a
							href={audioController.currentTrack.externalUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="group pointer-events-auto inline-flex items-center"
							style="height: 1em; width: 1.6em; transform: translateY(-0.12em) scale(2);"
							aria-label="Listen on SoundCloud">
							<div
								class="h-full w-full bg-(--text-color) group-hover:bg-(--highlight-color)"
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
					<span>{audioController.currentTrack.title}</span>
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
			class="absolute right-0 bottom-0 left-0 h-3.75 cursor-pointer touch-none"
			bind:this={progressBar}
			role="button"
			tabindex="0"
			aria-label="Seek"
			onmousedown={onDragStart}
			ontouchstart={onDragStart}>
			<!-- playhead -->
			<div
				class="absolute bottom-0 z-20 flex h-3 w-10 items-center justify-center bg-(--text-color) text-[10px] font-bold text-(--bg-color) md:w-15 md:text-sm"
				style="left: {audioController.duration
					? (audioController.currentTime / audioController.duration) * 100
					: 0}%; transform: translateX(-{audioController.duration
					? (audioController.currentTime / audioController.duration) * 100
					: 0}%); opacity: {audioController.currentTrack ? 1 : 0};">
				| | |
			</div>
			<!-- progress bar (inverse hue) -->
			<div
				class="pointer-events-none absolute bottom-0 left-0 z-10 h-3"
				style="width: {audioController.duration
					? (audioController.currentTime / audioController.duration) * 100
					: 0}%; transition: {isDragging ? 'none' : 'width 0.1s linear'};">
				<div class="h-full w-full" style="background-color: var(--highlight-color);"></div>
			</div>
		</div>
	</div>
</div>
