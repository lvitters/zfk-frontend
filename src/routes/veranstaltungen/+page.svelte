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
			previewText:
				e.description.length > 300 ? e.description.slice(0, 300) + "..." : e.description,
		}))
	);

	// extract unique years and sort them in ascending order
	let years = $derived(
		Array.from(new Set(events.map((event) => event.year))).sort(
			(a, b) => Number(a) - Number(b)
		)
	);

	// get the current year
	const currentYear = new Date().getFullYear();

	let selectedYear = $state<number>(currentYear);
	let initialized = false;

	$effect(() => {
		if (!initialized && years.length > 0) {
			selectedYear = years.includes(currentYear)
				? currentYear
				: (years[years.length - 1] as number);
			initialized = true;
		}
	});

	let filteredEvents = $derived(events.filter((event) => event.year === selectedYear));

	function selectYear(year: number) {
		selectedYear = year;
	}

	// track expanded states using a set
	let expandedEventIds = $state(new Set());

	function toggleEvent(id: string) {
		// create a new set to trigger reactivity
		const newSet = new Set(expandedEventIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		expandedEventIds = newSet;
	}
</script>

<YearSelect {years} year={selectedYear} {selectYear} />

<div class="mx-7 mt-4 flex max-w-2xl flex-col gap-10 pb-24">
	{#each filteredEvents as event}
		<div class="flex flex-col gap-2 border-b border-black pt-3 pb-6">
			<!-- date -->
			<div class="text-sm text-gray-500">{event.displayDate}</div>

			<!-- title -->
			<h2 class="text-2xl font-medium">{event.title}</h2>

			<!-- content -->
			<div class="text-lg leading-relaxed">
				{#if expandedEventIds.has(event.id)}
					<div in:fade={{ duration: 200 }}>
						{@html event.fullText}
					</div>
				{:else}
					<div in:fade={{ duration: 200 }}>
						{@html event.previewText}
					</div>
				{/if}
			</div>

			<!-- continue button -->
			<button
				class="mt-2 w-fit cursor-pointer border-b border-transparent text-base font-bold hover:border-black"
				onclick={() => toggleEvent(event.id)}
			>
				{expandedEventIds.has(event.id) ? "close" : "continue"}
			</button>
		</div>
	{/each}
</div>