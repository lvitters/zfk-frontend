<script lang="ts">
	import { currentTrack } from "$lib/playerStore";

	let audio: HTMLAudioElement = $state();
	let paused = $state(true);
	let currentTime = $state(0);
	let duration = $state(0);
	let hoverIndicator = $state(null);
	let src = $state("");

	currentTrack.subscribe((track) => {
		if (track) {
			src = track.filePath;
			// reset state
			currentTime = 0;
			duration = 0;
			paused = true;
			// autoplay
			setTimeout(() => {
				if (audio) {
					audio.play();
				}
			}, 100);
		}
	});

	// start playback
	function playAudio() {
		audio.play();
	}

	// stop playback
	function pauseAudio() {
		audio.pause();
	}

	// play from a specific time in the audio
	function seek(event) {
		const progressWidth = event.currentTarget.offsetWidth;
		const mouseX = event.offsetX;
		const newTime = (mouseX / progressWidth) * duration;
		currentTime = newTime;
	}

	// show indicator when hovering over the progress bar
	function showHoverIndicator(event) {
		const progressBar = event.currentTarget;
		const rect = progressBar.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const width = rect.width;
		const indicatorWidth = 6;

		// calculate clip-path inset values
		const right = width - mouseX - indicatorWidth;
		const left = mouseX;

		// apply clip-path to show only a slice of the full-width rainbow indicator
		hoverIndicator.style.clipPath = `inset(0px ${right}px 0px ${left}px)`;
		hoverIndicator.classList.remove("opacity-0");
	}

	function hideHoverIndicator() {
		hoverIndicator.classList.add("opacity-0");
	}

	const formatTime = (time) => {
		if (isNaN(time)) return "0:00";
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = Math.floor(time % 60);
		if (hours > 0) {
			return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		}
		return `${minutes}:${String(seconds).padStart(2, "0")}`;
	};

	function closePlayer() {
		currentTrack.set(null); // clear the current track to hide the player
		if (audio) {
			audio.pause(); // also stop playback
			audio.currentTime = 0; // reset time
		}
	}
</script>

{#if $currentTrack}
	<div class="fixed bottom-0 left-0 flex w-full items-center gap-4 border-t bg-white p-4">
		<audio
			bind:this={audio}
			bind:paused
			bind:duration
			bind:currentTime
			onloadedmetadata={() => (duration = audio.duration)}
			{src}>
			<source {src} type="audio/mp3" />
			Your browser does not support the audio element.
		</audio>

		<div class="flex items-center">
			{#if paused}
				<button class="flex cursor-pointer text-lg hover:text-red-500" onclick={playAudio}>play</button>
			{:else}
				<button class="flex cursor-pointer text-lg hover:text-red-500" onclick={pauseAudio}>pause</button>
			{/if}
		</div>

		<div
			class="animate-rainbow relative flex h-2 grow cursor-pointer items-center bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] ease-linear"
			role="button"
			tabindex="0"
			aria-label="Seek in audio"
			onclick={seek}
			onmousemove={showHoverIndicator}
			onmouseleave={hideHoverIndicator}
			onkeydown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					seek(e);
				}
			}}>
			<!-- gray overlay for remaining time -->
			<div
				class="pointer-events-none absolute top-0 right-0 bottom-0 bg-gray-300"
				style="width: {100 - (duration ? (currentTime / duration) * 100 : 0)}%">
			</div>

			<!-- hover indicator (Full width, masked via clip-path) -->
			<!-- changed 'hidden' to 'opacity-0' to ensure animation remains synced with the progress bar -->
			<div
				class="animate-rainbow pointer-events-none absolute top-1/2 left-0 z-10 h-16 w-full -translate-y-1/2 bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] opacity-0 ease-linear"
				bind:this={hoverIndicator}>
			</div>
		</div>

		<div class="flex w-32 items-center justify-center">
			<span>{formatTime(currentTime)} / {formatTime(duration)}</span>
		</div>

		<button class="ml-auto flex-shrink-0 cursor-pointer text-lg hover:text-red-500" onclick={closePlayer}>X</button>
	</div>
{/if}
