<script lang="ts">
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { currentTrack } from "$lib/playerStore";
	import type { Track } from "$lib/types";
	import { getNavHeight } from "$lib/layoutState.svelte";

	let { data }: { data: { audioFiles: Track[] } } = $props();
	const { audioFiles } = data;

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(b) - Number(a));

	// apply to selectedYear
	let selectedYear = $state<string>(years[0]);

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

	const scrollOffset = 20; // define a small gap in pixels

	function scrollToElement(el: HTMLElement) {
		const container = document.getElementById("main-content-scroll-container");

		if (container && window.innerWidth >= 1024) {
			// Desktop scrolling via container
			const containerRect = container.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const relativeTop = elRect.top - containerRect.top;
			const targetScroll = container.scrollTop + relativeTop - scrollOffset;

			container.scrollTo({ top: targetScroll, behavior: "smooth" });
		} else {
			// Mobile scrolling via window
			const navHeight = getNavHeight();
			const y = el.getBoundingClientRect().top + window.scrollY - navHeight - scrollOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	}

	function selectYear(year: string) {
		selectedYear = year; // keep selectedYear updated for styling in YearSelect
		// find the first audio file for the selected year
		const firstFileOfYear = audioFiles.find((file) => file.year === year);
		if (firstFileOfYear) {
			const el = eventRefs.get(firstFileOfYear.id);
			if (el) {
				scrollToElement(el);
			}
		}
	}

	function selectTrack(track: Track) {
		currentTrack.set(track);
	}

	import NavBottomPortal from "$lib/NavBottomPortal.svelte";
	import { onMount } from "svelte";

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

<NavBottomPortal>
	<YearSelect {years} year={selectedYear} {selectYear} />
</NavBottomPortal>

<!-- display files -->
<div class="flex w-full flex-col gap-2" style="padding-bottom: {bottomPadding}px;">
	{#each audioFiles as file}
		<!-- file row -->
		<button
			class="glow-box my-2 flex cursor-pointer flex-col rounded-3xl p-4 text-left"
			onclick={() => selectTrack(file)}
			use:addRef={file.id}>
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
