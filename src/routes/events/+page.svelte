<script lang="ts">
	import { fade } from "svelte/transition";

	// placeholder events data
	let events = [
		{
			id: 1,
			date: "20.11.2025",
			title: "jazz night at the archive",
			previewText: "join us for a smooth evening of jazz classics...",
			fullText:
				"join us for a smooth evening of jazz classics performed by the local trio. entry is free, and drinks will be served at the bar. doors open at 19:00.",
		},
		{
			id: 2,
			date: "05.12.2025",
			title: "experimental sound workshop",
			previewText: "explore the boundaries of sound in this interactive workshop...",
			fullText:
				"explore the boundaries of sound in this interactive workshop led by renowned sound artist. participants will get hands-on experience with analog synthesizers and tape loops. limited spots available.",
		},
		{
			id: 3,
			date: "15.12.2025",
			title: "end of year gala",
			previewText: "celebrate the end of the year with us...",
			fullText:
				"celebrate the end of the year with us. there will be live performances, a buffet, and a look back at the highlights of 2025. dress code: semi-formal.",
		},
	];

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

<div class="mx-7 mt-4 flex max-w-2xl flex-col gap-10 pb-24">
	{#each events as event}
		<div class="flex flex-col gap-2 border-b border-black pb-6">
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