<script lang="ts">
	import { fade } from "svelte/transition";
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";

	let { data } = $props();

	let events = $derived(
		data.events.map((e) => ({
			...e,
			year: new Date(e.date).getFullYear(),
			displayDate: e.formattedDate,
			fullText: e.description,
		})),
	);

	// extract unique years and sort them in ascending order
	let years = $derived(Array.from(new Set(events.map((event) => event.year))).sort((a, b) => Number(a) - Number(b)));

	// get the current year
	const currentYear = new Date().getFullYear();

	let selectedYear = $state<number>(currentYear);
	let initialized = false;

	$effect(() => {
		if (!initialized && years.length > 0) {
			selectedYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as number);
			initialized = true;
		}
	});

	let filteredEvents = $derived(events.filter((event) => event.year === selectedYear));

	function selectYear(year: number) {
		selectedYear = year;
	}
</script>

<div class="flex justify-start w-full">
    <YearSelect {years} year={selectedYear} {selectYear} />
</div>

<div class="mt-4 flex w-full flex-col gap-2 pb-24">
	{#each filteredEvents as event}
		<div class="flex flex-col gap-2 border-b border-[var(--item-text-color)] bg-[var(--item-bg-color)] text-[var(--item-text-color)] p-4 my-2 rounded-lg" style="box-shadow: var(--box-glow);">
			<!-- date -->
			<div class="text-xs md:text-sm">{event.displayDate}</div>

			<!-- title -->
			<h2 class="text-lg font-medium md:text-2xl">{event.title}</h2>

			<!-- content -->
			<div class="text-sm leading-relaxed md:text-lg">
				<div in:fade={{ duration: 200 }}>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html event.fullText}
				</div>
			</div>
		</div>
	{/each}
</div>
