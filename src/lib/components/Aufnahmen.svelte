<script lang="ts">
	import YearSelect from "$lib/components/YearSelect.svelte";
	import { currentTrack, isPlaying } from "$lib/stores";
	import type { Track } from "$lib/types";
	import { tick } from "svelte";

	let { audioFiles, selectedYear = $bindable() }: { audioFiles: Track[]; selectedYear?: string } = $props();

	let filteredAudioFiles = $derived(audioFiles.filter((file) => file.year === selectedYear));

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(b) - Number(a));

	if (!selectedYear && years.length > 0) {
		selectedYear = years[0];
	}

	let listContainer = $state<HTMLElement | null>(null);
	let innerContainer = $state<HTMLElement | null>(null);
	let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

	// select a year and smoothly animate the container height change
	async function selectYear(year: string) {
		if (year === selectedYear) return;

		// 1. lock current height
		if (listContainer) {
			const currentHeight = listContainer.offsetHeight;
			listContainer.style.height = `${currentHeight}px`;
		}

		selectedYear = year;

		// 2. wait for dom update
		await tick();

		// 3. animate to new height
		if (listContainer && innerContainer) {
			const newHeight = innerContainer.offsetHeight;
			listContainer.style.height = `${newHeight}px`;

			if (transitionTimeout) clearTimeout(transitionTimeout);
			transitionTimeout = setTimeout(() => {
				if (listContainer) {
					listContainer.style.height = "auto";
				}
			}, 300); // matches duration-300
		}
	}

	// select a track to play
	function selectTrack(track: Track) {
		currentTrack.set(track);
	}
</script>

<!-- display files list container -->
<div class="flex w-full flex-col bg-[var(--bg-color)]">
	<!-- year select header -->
	<div class="w-full border-b-2 border-[var(--text-color)] p-4">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	<div bind:this={listContainer} class="w-full overflow-hidden transition-[height] duration-300 ease-in-out">
		<div bind:this={innerContainer} class="w-full">
			{#each filteredAudioFiles as file}
				{@const isActive = file.id === $currentTrack?.id}
				<!-- individual file row -->
				<button
					class="group relative flex w-full cursor-pointer flex-col gap-1 border-b-2 border-[var(--text-color)] p-4 text-left duration-100 last:border-b-0 {isActive
						? 'bg-[var(--text-color)] text-[var(--bg-color)]'
						: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
					onclick={() => {
						if (isActive) {
							isPlaying.update((p) => !p);
						} else {
							selectTrack(file);
						}
					}}>
					<!-- date row with optional SoundCloud icon -->
					<div class="flex h-6 w-full shrink-0 items-center text-base md:h-7 md:text-xl">
						<span class="mr-auto md:mr-2">
							{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
						</span>
						{#if file.isExternal}
							<!-- SoundCloud logo aligned to the right of the date text (mobile) or left (desktop) -->
							<a
								href={file.externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								onclick={(e) => {
									e.stopPropagation(); // prevent selectTrack from being called when clicking the logo
								}}
								class="ml-auto inline-flex h-full flex-shrink-0 origin-center items-center transition-transform duration-200 hover:scale-110 md:ml-0">
								<!-- White Logo (default: visible. active/hover: hidden) -->
								<img
									src="/soundcloud_icon_white_transparent.png"
									alt="SoundCloud"
									class="h-full w-auto object-contain opacity-100 {isActive
										? 'hidden'
										: 'block group-hover:hidden'}" />
								<!-- Black Logo (default: hidden. active/hover: visible) -->
								<img
									src="/soundcloud_icon_black_transparent.png"
									alt="SoundCloud"
									class="h-full w-auto object-contain opacity-100 {isActive
										? 'block'
										: 'hidden group-hover:block'}" />
							</a>
						{/if}
					</div>
					<!-- title -->
					<div class="text-lg font-medium md:text-2xl">
						{file.title}
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
