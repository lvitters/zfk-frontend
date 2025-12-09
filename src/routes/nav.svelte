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

<div class="relative flex flex-col">
	<!-- Top Section: AudioPlayer / Logo - part to be hidden -->
	<div bind:clientHeight={topSectionHeight}>
		<div class="mb-2 mt-7 flex w-full items-start justify-between md:mt-4">
			{#if $currentTrack}
				<div class="mt-5 min-w-0 grow">
					<AudioPlayer />
				</div>
			{:else}
				<div class="mt-2 flex grow items-center justify-center text-lg text-gray-500">
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
						: ''} var(--image-glow-filter);" />
				<div
					class="absolute -bottom-1 -left-5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full md:-bottom-1 md:-left-6 md:h-8 md:w-8">
					<img
						src="/playpause.png"
						alt="Play/Pause"
						class="h-full w-full object-contain"
						style="filter: {isDark ? 'invert(1)' : ''} var(--image-glow-filter);" />
				</div>
			</button>
		</div>
	</div>

	<!-- bottom section: page select, controls, navbottom - part to remain visible -->
	<div bind:clientHeight={bottomSectionHeight}>
		<div class="relative flex w-full items-center justify-between py-2">
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
			</nav>

			<!-- Controls: Theme Toggle & Nav Arrow -->
			<div class="flex items-center gap-3">
				<!-- theme toggle -->
				<button
					onclick={toggleTheme}
					class="cursor-pointer text-sm md:text-2xl"
					aria-label="Toggle Dark Mode">
					{#if isDark}☀︎{:else}☾{/if}
				</button>

				<!-- toggle arrow -->
				<button
					onclick={() => (isOpen = !isOpen)}
					class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
					aria-label={isOpen ? "Close navigation" : "Open navigation"}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
						class="h-4 w-4 {isOpen ? 'rotate-180' : 'rotate-0'}">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
					</svg>
				</button>
			</div>
		</div>

		{#if navBottom && typeof navBottom === 'function'}
			<div class="mt-4 pb-4 pr-0 pt-0">
				{@render navBottom()}
			</div>
		{/if}
	</div>
</div>
