<script lang="ts">
	import { audioController } from "$lib/audioController.svelte";
	import { soundCloudConsent, pendingConsentTrackId } from "$lib/stores";
	import { onMount, tick } from "svelte";

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
		if (audioEl) {
			audioController.setElements(audioEl, scIframeEl!);
		}
	});

	// update controller when sc iframe becomes available (after consent)
	$effect(() => {
		if (audioEl && scIframeEl) {
			audioController.setElements(audioEl, scIframeEl);
		}
	});

	// pick a random track from the list and play it
	function randomizeAndPlay() {
		if (audioFiles && audioFiles.length > 0) {
			const randomIndex = Math.floor(Math.random() * audioFiles.length);
			const randomTrack = audioFiles[randomIndex];

			if (randomTrack.isExternal && !$soundCloudConsent) {
				$pendingConsentTrackId = randomTrack.id;
				audioController.stop(); // stop any current audio
				return;
			}

			audioController.play(randomTrack);
		}
	}

	async function acceptSoundCloud() {
		soundCloudConsent.set(true);
		// wait for DOM to render the iframe and for the effect to call setElements
		await tick();

		if ($pendingConsentTrackId) {
			const track = audioFiles.find((f) => f.id === $pendingConsentTrackId);
			if (track) {
				audioController.play(track);
			}
			$pendingConsentTrackId = null;
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
	{#if $soundCloudConsent}
		<script src="https://w.soundcloud.com/player/api.js"></script>
	{/if}
</svelte:head>

<div class="flex w-full flex-col">
	<!-- HTML5 Audio (hidden but active) -->
	<audio bind:this={audioEl} preload="metadata" style="display: none;"></audio>

	<!-- SoundCloud Widget Iframe (hidden but active) -->
	{#if $soundCloudConsent}
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
	{/if}

	<!-- audio header: spinning logo + track info + progress bar -->
	<div
		class="relative flex w-full items-center overflow-hidden border-b-2 border-(--text-color) bg-(--bg-color) p-4 py-6 md:py-8">
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

		{#if $pendingConsentTrackId}
			<!-- consent prompt in header -->
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 items-center gap-4">
				<span class="text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
					SoundCloud Dienste aktivieren?
				</span>
				<button
					onclick={acceptSoundCloud}
					class="pointer-events-auto cursor-pointer bg-(--text-color) p-1 text-[clamp(1rem,3vw,1.5rem)] leading-none whitespace-nowrap text-(--bg-color) hover:bg-(--highlight-color) active:bg-(--highlight-color)">
					JA
				</button>
				<button
					onclick={() => ($pendingConsentTrackId = null)}
					class="pointer-events-auto cursor-pointer p-1 text-[clamp(1rem,3vw,1.5rem)] leading-none whitespace-nowrap hover:text-(--highlight-color) active:text-(--highlight-color)">
					X
				</button>
			</div>
		{:else if audioController.currentTrack}
			<!-- track info (logo + time + title) to the right of the vinyl -->
			<div class="pointer-events-none relative z-20 ml-4 flex flex-1 flex-col items-start gap-1 pt-2">
				<!-- soundcloud row -->
				<a
					href={audioController.currentTrack.externalUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="group pointer-events-auto inline-flex h-[clamp(1rem,3vw,1.5rem)] w-[clamp(4.5rem,13.5vw,6.75rem)] items-center"
					aria-label="Listen on SoundCloud">
					<div
						class="h-full w-full bg-(--text-color) mask-[url('/soundcloud_logo_text_transparent.png')] mask-contain mask-left mask-no-repeat group-hover:bg-(--highlight-color)">
					</div>
				</a>

				<!-- metadata (play progress) -->
				<div
					class="flex shrink-0 items-center gap-5 text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums opacity-85">
					<span>{formatTime(audioController.currentTime)} / {formatTime(audioController.duration)}</span>
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
