<script lang="ts">
	import YearSelect from "$lib/components/YearSelect.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";
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

	async function selectYear(year: string) {
		if (year === selectedYear) return;

		// 1. Lock current height
		if (listContainer) {
			const currentHeight = listContainer.offsetHeight;
			listContainer.style.height = `${currentHeight}px`;
		}

		selectedYear = year;

		// 2. Wait for DOM update
		await tick();

		// 3. Animate to new height
		if (listContainer && innerContainer) {
			const newHeight = innerContainer.offsetHeight;
			listContainer.style.height = `${newHeight}px`;

			if (transitionTimeout) clearTimeout(transitionTimeout);
			transitionTimeout = setTimeout(() => {
				if (listContainer) {
					listContainer.style.height = "auto";
				}
			}, 300); // Matches duration-300
		}
	}

	function selectTrack(track: Track) {
		currentTrack.set(track);
	}
</script>

<!-- display files -->
<div class="flex w-full flex-col bg-[var(--bg-color)]">
	<!-- Year Select -->
	<div class="w-full border-b-2 border-[var(--text-color)] p-4">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	<div bind:this={listContainer} class="w-full overflow-hidden transition-[height] duration-300 ease-in-out">
		<div bind:this={innerContainer} class="w-full">
			{#each filteredAudioFiles as file}
				<!-- file row -->
				<button
					class="relative flex w-full cursor-pointer flex-col gap-1 border-b-2 border-[var(--text-color)] p-4 text-left duration-100 last:border-b-0 {file.id ===
					$currentTrack?.id
						? 'bg-[var(--text-color)] text-[var(--bg-color)]'
						: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
					onclick={() => selectTrack(file)}>
					<!-- date -->
					<div class="shrink-0 text-base opacity-70 md:text-xl">
						{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
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
