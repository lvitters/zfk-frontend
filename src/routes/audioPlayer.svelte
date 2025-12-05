<script lang="ts">
	import { currentTrack, isPlaying } from "$lib/playerStore";
	import type { Track } from "$lib/types";

	let audio: HTMLAudioElement | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let src = $state("");

	let isDragging = $state(false);
	let progressBar: HTMLDivElement | undefined = $state();

	let titleElement: HTMLDivElement | undefined = $state();
	let isOverflowing = $state(false);

	function checkOverflow() {
		if (!titleElement) return;
		const parent = titleElement.parentElement;
		if (!parent) return;

		const scrollWidth = titleElement.scrollWidth;
		const clientWidth = parent.getBoundingClientRect().width;

		if (scrollWidth > clientWidth) {
			isOverflowing = true;
			const offset = clientWidth - scrollWidth;
			titleElement.style.setProperty("--scroll-offset", `${offset}px`);
		} else {
			isOverflowing = false;
			titleElement.style.removeProperty("--scroll-offset");
		}
	}

	$effect(() => {
		if (!titleElement) return;
		const parent = titleElement.parentElement;

		const ro = new ResizeObserver(() => {
			checkOverflow();
		});

		ro.observe(titleElement);
		if (parent) ro.observe(parent);

		return () => ro.disconnect();
	});

	// Sync $isPlaying store to audio element state
	$effect(() => {
		if (!audio) return;
		if ($isPlaying && audio.paused) {
			audio.play().catch((e) => console.error("Play failed:", e));
		} else if (!$isPlaying && !audio.paused) {
			audio.pause();
		}
	});

	currentTrack.subscribe((track: Track | null) => {
		if (track) {
			src = track.filePath;
			// reset state
			currentTime = 0;
			duration = 0;
			// autoplay
			setTimeout(() => {
				if (audio) {
					audio.play();
				}
			}, 100);
		}
	});

	function updateTime(clientX: number) {
		if (!progressBar || !audio || !duration) return;

		const rect = progressBar.getBoundingClientRect();
		const x = clientX - rect.left;
		const width = rect.width;
		const ratio = Math.max(0, Math.min(1, x / width));
		const newTime = ratio * duration;

		audio.currentTime = newTime;
		currentTime = newTime;
	}

	function onDragStart(event: MouseEvent | TouchEvent) {
		if (audio && audio.paused) {
			isPlaying.set(true);
		}

		isDragging = true;

		const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
		updateTime(clientX);

		window.addEventListener("mousemove", onDragMove);
		window.addEventListener("touchmove", onDragMove, { passive: false });
		window.addEventListener("mouseup", onDragEnd);
		window.addEventListener("touchend", onDragEnd);
	}

	function onDragMove(event: MouseEvent | TouchEvent) {
		if (!isDragging) return;
		if (event.cancelable) {
			event.preventDefault();
		}

		const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
		updateTime(clientX);
	}

	function onDragEnd() {
		isDragging = false;
		window.removeEventListener("mousemove", onDragMove);
		window.removeEventListener("touchmove", onDragMove);
		window.removeEventListener("mouseup", onDragEnd);
		window.removeEventListener("touchend", onDragEnd);
	}

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

{#if $currentTrack}
	<div class="flex grow flex-col gap-1 pr-4">
		<div class="flex items-center gap-4">
			<audio
				bind:this={audio}
				bind:duration
				bind:currentTime
				onplay={() => isPlaying.set(true)}
				onpause={() => isPlaying.set(false)}
				onloadedmetadata={() => (duration = (audio as HTMLAudioElement).duration)}
				{src}>
				Your browser does not support the audio element.
			</audio>

			<!-- progress bar wrapper -->
			<div class="relative h-2 grow bg-gray-300" bind:this={progressBar}>
				<!-- glow Layer -->
				<div
					class="animate-rainbow absolute inset-0 h-full w-full bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] opacity-100 blur-lg ease-linear"
					style="clip-path: inset(-2rem {100 -
						(duration ? (currentTime / duration) * 100 : 0)}% -2rem -2rem);">
				</div>

				<!-- main Layer -->
				<div
					class="animate-rainbow absolute inset-0 h-full w-full bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] ease-linear"
					style="clip-path: inset(0 {100 - (duration ? (currentTime / duration) * 100 : 0)}% 0 0);">
				</div>

				<!-- interaction area (Hit Box) -->

				<div
					class="absolute left-0 top-1/2 z-50 h-16 w-full -translate-y-1/2 cursor-pointer"
					style="touch-action: none;"
					role="button"
					tabindex="0"
					aria-label="Seek in audio"
					onmousedown={onDragStart}
					ontouchstart={onDragStart}>
					<!-- current progress indicator -->
					<div
						class="animate-rainbow pointer-events-none absolute bottom-0 top-0 m-auto h-6 w-[2px] -translate-x-1/2 bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] ease-linear md:h-full md:w-[4px]"
						style="left: {duration ? (currentTime / duration) * 100 : 0}%; box-shadow: var(--box-glow);">
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center justify-between text-left text-xs text-gray-500">
			<div class="min-w-0 flex-1 overflow-hidden">
				<div
					bind:this={titleElement}
					class="w-max whitespace-nowrap will-change-transform {isOverflowing
						? 'animate-scroll-back-forth'
						: ''}">
					{$currentTrack.title}
				</div>
			</div>

			<div class="flex w-12 shrink-0 justify-end pl-2 md:w-auto">
				<span class="tabular-nums">{formatTime(currentTime)} <span class="hidden md:inline-block">/ {formatTime(duration)}</span></span>
			</div>
		</div>
	</div>
{/if}
