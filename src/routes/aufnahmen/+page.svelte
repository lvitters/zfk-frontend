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

	function selectYear(year: string) {
		selectedYear = year;
	}

	function selectTrack(track: Track) {
		currentTrack.set(track);
	}
</script>

<div class="flex w-full justify-start">
	<YearSelect {years} year={selectedYear} {selectYear} />
</div>

<!-- display files -->
<div class="mt-4 flex w-full flex-col gap-2 pb-24">
	{#each audioFiles as file}
		{#if file.year == selectedYear}
			<!-- file row -->
			<button
				class="my-2 flex cursor-pointer flex-col rounded-lg bg-[var(--item-bg-color)] p-4 text-left text-[var(--item-text-color)] transition-colors duration-300 hover:bg-[var(--bg-color)] hover:text-[var(--text-color)]"
				onclick={() => selectTrack(file)}
				style="box-shadow: var(--box-glow);">
				<!-- date -->
				<div class="flex items-center pr-4 text-sm">
					{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
				</div>
				<!-- title -->
				<div class="my-1 flex items-center text-2xl font-medium">
					{file.title}
				</div>
			</button>
		{/if}
	{/each}
</div>
