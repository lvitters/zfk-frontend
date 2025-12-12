<script lang="ts">
	import YearSelect from "$lib/components/yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";
	import type { Track } from "$lib/types";
	import { onMount } from "svelte";

	let { audioFiles, selectedYear = $bindable() }: { audioFiles: Track[]; selectedYear?: string } = $props();

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(b) - Number(a));

	$effect(() => {
		if (!selectedYear && years.length > 0) {
			selectedYear = years[0];
		}
	});

	let filteredAudioFiles = $derived(audioFiles.filter((file: any) => file.year === selectedYear));

	// eventRefs and addRef for scrolling
	let eventRefs = new Map<string, HTMLElement>();

	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			},
		};
	}

	function selectYear(year: string) {
		selectedYear = year;
	}

	function selectTrack(track: Track) {
		currentTrack.set(track);
	}

	let bottomPadding = $state(128);

	onMount(() => {
		const updatePadding = () => {
			if (window.innerWidth >= 1024) {
				bottomPadding = window.innerHeight;
			} else {
				bottomPadding = 128;
			}
		};

		updatePadding();
		window.addEventListener("resize", updatePadding);

		return () => {
			window.removeEventListener("resize", updatePadding);
		};
	});
</script>

<!-- display files -->
<div class="flex w-full flex-col bg-[var(--bg-color)]">
	<!-- Year Select -->
	<div class="w-full border-b-2 border-[var(--text-color)] p-4">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	{#each filteredAudioFiles as file, index}
		<!-- file row -->
		<button
			class="relative flex w-full cursor-pointer flex-col gap-1 border-b-2 border-[var(--text-color)] p-4 text-left duration-100 last:border-b-0 {file.id ===
			$currentTrack?.id
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => selectTrack(file)}
			use:addRef={file.id}>
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
