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

	import NavBottomPortal from '$lib/NavBottomPortal.svelte';
</script>

<NavBottomPortal>
	<YearSelect {years} year={selectedYear} {selectYear} />
</NavBottomPortal>

<!-- display files -->
<div class="flex w-full flex-col gap-2 pb-24">
	{#each audioFiles as file}
		{#if file.year == selectedYear}
			<!-- file row -->
			<button
				class="glow-box my-2 flex cursor-pointer flex-col rounded-3xl p-4 text-left"
				onclick={() => selectTrack(file)}>
				<!-- date -->
				<div class="flex items-center pr-4 text-xs md:text-sm">
					{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}
				</div>
				<!-- title -->
				<div class="my-1 flex items-center text-lg font-medium md:text-2xl">
					{file.title}
				</div>
			</button>
		{/if}
	{/each}
</div>
