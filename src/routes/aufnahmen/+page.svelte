<script lang="ts">
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";
	import type { Track } from "$lib/types";
	import { getNavHeight } from "$lib/layoutState.svelte";

	let { data }: { data: { audioFiles: Track[] } } = $props();
	const { audioFiles } = data;

	// extract unique years and sort them in ascending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(a) - Number(b));

	// get the current year
	const currentYear = new Date().getFullYear().toString();
	const defaultYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as string);

	// apply to selectedYear
	let selectedYear = $state<string>(defaultYear);

	// eventRefs and addRef for scrolling
	let eventRefs = new Map<string, HTMLElement>();

	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			}
		}
	}
	
	const scrollOffset = 20; // Define a small gap in pixels

	function selectYear(year: string) {
		selectedYear = year; // Keep selectedYear updated for styling in YearSelect
		// Find the first audio file for the selected year
		const firstFileOfYear = audioFiles.find(file => file.year === year);
		if (firstFileOfYear) {
			const el = eventRefs.get(firstFileOfYear.id);
			if (el) {
				const navHeight = getNavHeight(); // Get the current nav height
				const y = el.getBoundingClientRect().top + window.scrollY - navHeight - scrollOffset; // Adjusted calculation
				window.scrollTo({ top: y, behavior: 'smooth' });
			}
		}
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
<div class="flex w-full flex-col gap-2">
	{#each audioFiles as file}
		<!-- file row -->
		<button
			class="glow-box my-2 flex cursor-pointer flex-col rounded-3xl p-4 text-left"
			onclick={() => selectTrack(file)}
			use:addRef={file.id}
		>
			<!-- date -->
			<div class="flex items-center pr-4 text-xs md:text-sm">
				{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.{file.year}
			</div>
			<!-- title -->
			<div class="my-1 flex items-center text-lg font-medium md:text-2xl">
				{file.title}
			</div>
		</button>
	{/each}
</div>
