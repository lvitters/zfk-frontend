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

<div class="my-7 flex flex-col max-md:mt-7 max-md:py-0">
	{#if $currentTrack}
		<div class="mb-7 mt-4 w-full">
			<AudioPlayer />
		</div>
	{:else}
		<div class="mb-7 mt-4 flex grow items-center justify-center text-lg text-gray-500">
			Zentrum für Kollektivkultur e.V.
		</div>
	{/if}

	<div class="flex w-full items-center justify-between">
		<!-- page select -->
		<nav class="flex items-center gap-6 text-2xl">
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
				class="cursor-pointer text-2xl transition-transform hover:scale-110"
				aria-label="Toggle Dark Mode">
				{#if isDark}☀︎{:else}☾{/if}
			</button>
		</nav>

		<!-- spinning logo -->
		<button class="relative flex cursor-pointer items-center" onclick={togglePlayback}>
			<img
				src="/logo_zfk_transparent.png"
				alt="ZfK Logo"
				class="animate-spin-vinyl h-[100px] w-auto cursor-pointer"
				style="animation-play-state: {$isPlaying ? 'running' : 'paused'}; filter: {isDark
					? 'invert(1)'
					: 'none'};" />
			<div
				class="absolute -bottom-1 -left-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full">
				<img
					src="/playpause.png"
					alt="Play/Pause"
					class="h-full w-full object-contain"
					style="filter: {isDark ? 'invert(1)' : 'none'};" />
			</div>
		</button>
	</div>
</div>
