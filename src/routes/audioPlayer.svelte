<script lang="ts">
	import { currentTrack, isPlaying } from "$lib/playerStore";
    import type { Track } from "$lib/types";

	let audio: HTMLAudioElement | undefined = $state();
	let currentTime = $state(0);
	let duration = $state(0);
	let hoverIndicator: HTMLDivElement | null = $state(null);
	let src = $state("");

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
			// paused = true; // Removed local paused state
			// autoplay
			setTimeout(() => {
				if (audio) {
					audio.play();
				}
			}, 100);
		}
	});

		// play from a specific time in the audio

		function seek(event: MouseEvent & { currentTarget: HTMLDivElement } | KeyboardEvent) {
            if (event instanceof KeyboardEvent) return; // Simple handling for now, logic was slightly mixed in original

            const target = event.currentTarget as HTMLDivElement;
			const rect = target.getBoundingClientRect();

			const progressWidth = rect.width;

			const mouseX = event.clientX - rect.left;

			const newTime = (mouseX / progressWidth) * duration;

			if (audio) {

				audio.currentTime = newTime;

				// If audio was paused, resume playback

				if (audio.paused) {

					isPlaying.set(true);

				}

			}

		}

	

		// show indicator when hovering over the progress bar

		function showHoverIndicator(event: MouseEvent & { currentTarget: HTMLDivElement }) {

			const progressBar = event.currentTarget;

			const rect = progressBar.getBoundingClientRect();

			const mouseX = event.clientX - rect.left;

			const width = rect.width;

			const indicatorWidth = 6;

	

			// calculate clip-path inset values

			const right = width - mouseX - indicatorWidth;

			const left = mouseX;

	

			// apply clip-path to show only a slice of the full-width rainbow indicator

			if (hoverIndicator) {

				hoverIndicator.style.clipPath = `inset(0px ${right}px 0px ${left}px)`;

				hoverIndicator.classList.remove("opacity-0");

				const parent = hoverIndicator.parentElement;
                if(parent) parent.style.cursor = "none"; // Hide cursor

			}

		}

	

		function hideHoverIndicator() {

			if (hoverIndicator) {

				hoverIndicator.classList.add("opacity-0");

				const progressBar = hoverIndicator.parentElement; // Get the parent element (progress bar wrapper)

				if (progressBar) progressBar.style.cursor = "pointer"; // Restore cursor

			}

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

		<div class="ml-6 flex grow flex-col gap-1 pr-4">

			<div class="flex items-center gap-4">

				<audio

					bind:this={audio}

					bind:duration

					bind:currentTime

					onplay={() => isPlaying.set(true)}

					onpause={() => isPlaying.set(false)}

					onloadedmetadata={() => (duration = (audio as HTMLAudioElement).duration)}

					{src}>

					<source {src} type="audio/mp3" />

					Your browser does not support the audio element.

				</audio>

	

							<!-- Progress Bar Wrapper -->

	

							<div class="relative h-2 grow">

	

								<!-- Visual Progress Bar -->

	

								<div

	

									class="animate-rainbow absolute inset-0 h-full w-full bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] ease-linear">

	

									<!-- gray overlay for remaining time -->

	

									<div

	

										class="pointer-events-none absolute top-0 right-0 bottom-0 bg-gray-300"

	

										style="width: {100 - (duration ? (currentTime / duration) * 100 : 0)}%">

	

									</div>

	

								</div>

	

				

	

								<!-- Interaction Area (Hit Box) -->

	

								<div

	

									class="absolute top-1/2 left-0 z-10 h-16 w-full -translate-y-1/2 cursor-pointer"

	

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

	

									<!-- hover indicator (Full width, masked via clip-path) -->

	

									<div

	

										class="animate-rainbow pointer-events-none absolute top-0 left-0 h-full w-full bg-[linear-gradient(270deg,#ff0000,#ff7f00,#ffff00,#00ff00,#0000ff,#4b0082,#8f00ff,#ff0000)] bg-[length:400%_400%] opacity-0 ease-linear"

	

										bind:this={hoverIndicator}>

	

									</div>

	

								</div>

	

							</div>

			</div>

			<div class="flex justify-between items-center text-xs text-gray-500 text-left">

				<div>{$currentTrack.title}</div>

				<div class="flex-shrink-0"><span>{formatTime(currentTime)} / {formatTime(duration)}</span></div>

			</div>

		</div>

	{/if}