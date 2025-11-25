<script lang="ts">
	import { fade } from "svelte/transition";
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";

	// placeholder events data
	let events = [
		{
			id: 101,
			year: 2023,
			date: "10.03.2023",
			title: "Project Launch",
			previewText: "The beginning of the journey...",
			fullText:
				"We officially started the project with a small gathering of core members. Ideas were shared and the first roadmap was drafted.",
		},
		{
			id: 102,
			year: 2023,
			date: "15.08.2023",
			title: "Summer Open Air",
			previewText: "A day of music and sun...",
			fullText:
				"Our first open air event in the courtyard. Local DJs played all day and we raised funds for the upcoming renovations.",
		},
		{
			id: 201,
			year: 2024,
			date: "02.02.2024",
			title: "Winter Workshop Series",
			previewText: "Learning together in the cold months...",
			fullText:
				"A series of workshops focused on analog photography and sound engineering. Hosted in the newly renovated workshop space.",
		},
		{
			id: 202,
			year: 2024,
			date: "20.09.2024",
			title: "Equinox Performance",
			previewText: "Celebrating the change of seasons...",
			fullText:
				"An experimental performance art piece celebrating the autumn equinox. Featuring guest artists from Berlin.",
		},
		{
			id: 1,
			year: 2025,
			date: "20.11.2025",
			title: "jazz night at the archive",
			previewText: "join us for a smooth evening of jazz classics...",
			fullText:
				"join us for a smooth evening of jazz classics performed by the local trio. entry is free, and drinks will be served at the bar. doors open at 19:00.",
		},
		{
			id: 2,
			year: 2025,
			date: "05.12.2025",
			title: "experimental sound workshop",
			previewText: "explore the boundaries of sound in this interactive workshop...",
			fullText:
				"explore the boundaries of sound in this interactive workshop led by renowned sound artist. participants will get hands-on experience with analog synthesizers and tape loops. limited spots available.",
		},
		{
			id: 3,
			year: 2025,
			date: "15.12.2025",
			title: "end of year gala",
			previewText: "celebrate the end of the year with us...",
			fullText:
				"celebrate the end of the year with us. there will be live performances, a buffet, and a look back at the highlights of 2025. dress code: semi-formal.",
		},
	];

	// extract unique years and sort them in ascending order
	const years = Array.from(new Set(events.map((event) => event.year))).sort((a, b) => Number(a) - Number(b));

	// get the current year
	const currentYear = new Date().getFullYear();
	const defaultYear = years.includes(currentYear) ? currentYear : (years[years.length - 1] as number);

	// apply to selectedYear
	let selectedYear = $state<number>(defaultYear);

	let filteredEvents = $state([]);

	$effect(() => {
		filteredEvents = events.filter((event) => event.year === selectedYear);
	});

	function selectYear(year: number) {
		selectedYear = year;
	}

	// track expanded states using a set
	let expandedEventIds = $state(new Set());

	function toggleEvent(id: number) {
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
		<div class="pt-3 flex flex-col gap-2 border-b border-black pb-6">
			<!-- date -->
			<div class="text-sm text-gray-500">{event.date}</div>
			
			<!-- title -->
			<h2 class="text-2xl font-medium">{event.title}</h2>

			<!-- content -->
			<div class="text-lg leading-relaxed">
				{#if expandedEventIds.has(event.id)}
					<div in:fade={{ duration: 200 }}>
						{event.fullText}
					</div>
				{:else}
					<div in:fade={{ duration: 200 }}>
						{event.previewText}
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
