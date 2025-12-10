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

	import { getNavBottom } from "$lib/layoutState.svelte";
	let navBottom = $derived(getNavBottom());

	let { isOpen = $bindable(true), topSectionHeight = $bindable(), bottomSectionHeight = $bindable() } = $props();
</script>

<div class="relative flex flex-col lg:h-full">
	<!-- top section: AudioPlayer / Logo - part to be hidden -->
	<div bind:clientHeight={topSectionHeight}>
		<div class="mb-2 mt-7 flex w-full flex-col items-center gap-4 md:mt-4 lg:mb-0 lg:mt-8 lg:gap-6">
			<!-- spinning logo -->
			<button class="relative flex shrink-0 cursor-pointer items-center" onclick={togglePlayback}>
				<img
					src="/logo_zfk_transparent.png"
					alt="ZfK Logo"
					class="animate-spin-vinyl image-glow-white h-[150px] w-auto cursor-pointer"
					style="animation-play-state: {$isPlaying ? 'running' : 'paused'};" />
				<div
					class="absolute -bottom-2 -left-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full">
					<img src="/playpause.png" alt="Play/Pause" class="image-glow-white h-full w-full object-contain" />
				</div>
			</button>

			{#if $currentTrack}
				<div class="w-full min-w-0">
					<AudioPlayer />
				</div>
			{:else}
				<div class="flex w-full items-center justify-center text-center text-sm md:text-xl lg:text-2xl">
					Zentrum für Kollektivkultur e.V.
				</div>
			{/if}
		</div>
	</div>

	<!-- bottom section: page select, controls, navbottom - part to remain visible -->
	<div bind:clientHeight={bottomSectionHeight} class="lg:flex lg:grow lg:flex-col lg:gap-8 lg:pt-8">
		<div
			class="relative flex w-full items-center justify-between pb-2 pt-4 lg:flex-col lg:items-start lg:justify-start lg:gap-8 lg:pb-0 lg:pt-0">
			<!-- page select -->
			<nav class="flex items-center gap-6 text-lg md:text-2xl lg:flex-col lg:items-start lg:gap-4 lg:text-3xl">
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
				<a
					href="/club"
					class="cursor-pointer hover:underline"
					class:underline={$page.url.pathname.startsWith("/club")}>
					Club
				</a>
				<a
					href="/info"
					class="cursor-pointer hover:underline"
					class:underline={$page.url.pathname.startsWith("/info")}>
					Info
				</a>
			</nav>

			<!-- controls: nav arrow -->
			<div class="flex items-center gap-3 lg:hidden">
				<!-- toggle arrow -->
				<button
					onclick={() => (isOpen = !isOpen)}
					class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full"
					aria-label={isOpen ? "Close navigation" : "Open navigation"}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-6 w-6 {isOpen ? 'rotate-180' : 'rotate-0'} overflow-visible transition-transform duration-100">
						<path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
					</svg>
				</button>
			</div>
		</div>

		{#if navBottom && typeof navBottom === "function"}
			<div class="mt-2 pb-4 pr-0 pt-0 lg:mt-0">
				{@render navBottom()}
			</div>
		{/if}
	</div>
</div>
