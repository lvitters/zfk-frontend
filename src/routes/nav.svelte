<script lang="ts">
	import { page } from "$app/stores";
	import { isPlaying, currentTrack } from "$lib/playerStore";
	import AudioPlayer from "./audioPlayer.svelte";
	import { onMount } from "svelte";

	let isDark = $state(false);

	onMount(() => {
		const stored = localStorage.getItem("theme");
		if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
			isDark = true;
			document.documentElement.classList.add("dark");
		} else {
			isDark = false;
			document.documentElement.classList.remove("dark");
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}

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

<div class="mt-7 mb-4 flex flex-col md:mt-7 md:mb-8">
	<div class="mt-4 flex w-full items-center justify-between mb-3 md:mb-7">
		{#if $currentTrack}
			<div class="grow">
				<AudioPlayer />
			</div>
		{:else}
			<div class="flex grow items-center justify-center text-lg text-gray-500">
				Zentrum für Kollektivkultur e.V.
			</div>
		{/if}

		<!-- spinning logo -->
		<button class="relative ml-4 flex shrink-0 cursor-pointer items-center" onclick={togglePlayback}>
			<img
				src="/logo_zfk_transparent.png"
				alt="ZfK Logo"
				class="animate-spin-vinyl h-[50px] w-auto cursor-pointer md:h-[75px]"
				style="animation-play-state: {$isPlaying ? 'running' : 'paused'}; filter: {isDark
					? 'invert(1)'
					: 'none'};" />
			<div
				class="absolute -bottom-1 -left-5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 md:-bottom-1 md:-left-6 md:h-8 md:w-8">
				<img
					src="/playpause.png"
					alt="Play/Pause"
					class="h-full w-full object-contain"
					style="filter: {isDark ? 'invert(1)' : 'none'};" />
			</div>
		</button>
	</div>

	<div class="flex w-full items-center justify-between">
		<!-- page select -->
		<nav class="flex items-center gap-3 text-sm md:gap-6 md:text-2xl">
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

			<!-- theme toggle -->
			<button
				onclick={toggleTheme}
				class="cursor-pointer text-sm transition-transform hover:scale-110 md:text-2xl"
				aria-label="Toggle Dark Mode">
				{#if isDark}☀︎{:else}☾{/if}
			</button>
		</nav>
	</div>
</div>
