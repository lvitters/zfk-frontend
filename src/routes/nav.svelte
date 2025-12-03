<script lang="ts">
	import { page } from "$app/stores";
	import { isPlaying, currentTrack } from "$lib/playerStore";
	import AudioPlayer from "./audioPlayer.svelte";

	async function randomizeAndPlay() {
		try {
			const response = await fetch("/api/audioTracks");
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const audioFiles = await response.json();

			if (audioFiles && audioFiles.length > 0) {
				const randomIndex = Math.floor(Math.random() * audioFiles.length);
				const randomTrack = audioFiles[randomIndex];
				currentTrack.set(randomTrack);
				isPlaying.set(true); // ensure playback starts
			} else {
				console.warn("No audio files found to play.");
			}
		} catch (error) {
			console.error("Failed to fetch or play random track:", error);
		}
	}

	function togglePlayback(event: MouseEvent) {
		if ($currentTrack) {
			event.preventDefault();
			isPlaying.update((p) => !p);
		} else {
			// no track selected, play a random one
			event.preventDefault(); // prevent navigating away
			randomizeAndPlay();
		}
	}
</script>

<div class="my-7 ml-7 flex flex-col max-md:mx-4 max-md:mt-7 max-md:py-0">
	<div class="flex w-full items-center">
		<button class="relative flex cursor-pointer items-center" onclick={togglePlayback}>
			<img
				src="/logo_zfk_transparent.png"
				alt="ZfK Logo"
				class="animate-spin-vinyl h-[100px] w-auto cursor-pointer"
				style="animation-play-state: {$isPlaying ? 'running' : 'paused'};" />
			<div
				class="absolute -bottom-1 -left-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full">
				<img src="/playpause.png" alt="Play/Pause" class="h-full w-full object-contain" />
			</div>
		</button>

		{#if $currentTrack}
			<AudioPlayer />
		{:else}
			<div class="ml-6 flex grow items-center text-lg text-gray-500">Zentrum für Kollektivkultur e.V.</div>
		{/if}
	</div>
	<nav class="mt-4 flex gap-6 text-2xl">
		<a
			href="/veranstaltungen"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith("/veranstaltungen")}>
			Veranstaltungen
		</a>
		<a
			href="/aufnahmen"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith("/aufnahmen")}>
			Aufnahmen
		</a>
		<a href="/club" class="cursor-pointer hover:underline" class:underline={$page.url.pathname.startsWith("/club")}>
			Club
		</a>
		<a href="/info" class="cursor-pointer hover:underline" class:underline={$page.url.pathname.startsWith("/info")}>
			Info
		</a>
	</nav>
</div>
