<script lang="ts">
	import { currentTrack } from "$lib/playerStore";

	let audio: HTMLAudioElement;
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
		const progress = (currentTime / duration) * rect.width;
		const isLeft = mouseX < progress;

		hoverIndicator.style.backgroundColor = isLeft ? "black" : "red";
		hoverIndicator.classList.add("md:block");
		hoverIndicator.style.left = `${mouseX}px`;
	}

	function hideHoverIndicator() {
		hoverIndicator.classList.remove("md:block");
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
			class="relative flex h-2 grow cursor-pointer items-center bg-gray-300"
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
			<div class="pointer-events-none absolute hidden h-full w-[1.5px] bg-red-500" bind:this={hoverIndicator}>
			</div>
			<div
				class="h-full w-0 bg-red-500 ease-linear"
				style="width: {duration ? (currentTime / duration) * 100 : 0}%">
			</div>
		</div>

		<div class="flex w-32 items-center justify-center">
			<span>{formatTime(currentTime)} / {formatTime(duration)}</span>
		</div>
	</div>
{/if}
