<!-- Copyright © 2025 Lucca Vitters. All rights reserved -->

<script lang="ts">
	import YearSelect from "./yearSelect.svelte";
	import Header from "./header.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";

	let { data } = $props();
	const { audioFiles } = data;

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(a) - Number(b));

	// get the current year
	const currentYear = new Date().getFullYear();
	const defaultYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as number);

	// apply to selectedYear
	let selectedYear = $state<number>(defaultYear);

	let filteredAudioFiles = $state([]);

	$effect(() => {
		filteredAudioFiles = audioFiles.filter((file) => file.year === selectedYear);
	});

	function selectYear(year: number) {
		selectedYear = year;
	}

	function selectTrack(track) {
		currentTrack.set(track);
	}
</script>

<Header></Header>

<YearSelect {years} year={selectedYear} {selectYear} />

<!-- display files -->
<div class="flex flex-col">
	{#each audioFiles as file}
		{#if file.year == selectedYear}
			<!-- file row -->
			<div class="flex pt-3 text-left">
				<button
					type="button"
					class="ml-18 flex cursor-pointer border-b-2 px-1 hover:border-black"
					class:border-black={file.filePath === $currentTrack?.filePath}
					class:border-transparent={file.filePath !== $currentTrack?.filePath}
					onclick={() => selectTrack(file)}>
					<!-- date -->
					<div class="flex items-center justify-center pr-4 whitespace-nowrap">
						{file.displayDate}
					</div>
					<!-- title -->
					<div class="my-1 flex items-center">
						{file.title}
					</div>
				</button>
			</div>
		{/if}
	{/each}
</div>
