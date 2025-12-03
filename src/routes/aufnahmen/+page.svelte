<script lang="ts">
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";
	import type { Track } from "$lib/types";

	let { data }: { data: { audioFiles: Track[] } } = $props();
	const { audioFiles } = data;

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(a) - Number(b));

	// get the current year
	const currentYear = new Date().getFullYear().toString();
	const defaultYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as string);

	// apply to selectedYear
	let selectedYear = $state<string>(defaultYear);

	let filteredAudioFiles: Track[] = $state([]);

	$effect(() => {
		filteredAudioFiles = audioFiles.filter((file) => file.year === selectedYear);
	});

	function selectYear(year: string) {
		selectedYear = year;
	}

	function selectTrack(track: Track) {
		currentTrack.set(track);
	}
</script>

<YearSelect {years} year={selectedYear} {selectYear} />

<!-- display files -->
<div class="flex flex-col">
	{#each audioFiles as file}
		{#if file.year == selectedYear}
			<!-- file row -->
			<div class="flex pt-3 text-left">
				<button
					type="button"
					class="ml-7 flex cursor-pointer border-b-2 px-1 hover:border-black"
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
