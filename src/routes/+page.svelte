<script lang="ts">
	import AudioHeader from "$lib/components/AudioHeader.svelte";
	import Aufnahmen from "$lib/components/Aufnahmen.svelte";
	import Programm from "$lib/components/Programm.svelte";
	import Club from "$lib/components/MainSection.svelte"; // Still needed for mainSection type
	import Info from "$lib/components/HeaderSection.svelte"; // Still needed for headerSection type

	import "$lib/css/fonts.css";
	import { slide } from "svelte/transition";

	let { data } = $props();
	let { events, audioFiles, dynamicSections, eventsTitle, recordingsTitle } = data;

	let expandedSection = $state(null as string | null);
	let programmYear = $state<number | undefined>();
	let aufnahmenYear = $state<string | undefined>();

	function toggleSection(sectionSlug: string) {
		if (expandedSection === sectionSlug) {
			expandedSection = null;
		} else {
			expandedSection = sectionSlug;
		}
	}
</script>

<div class="flex min-h-screen w-full flex-col px-2 md:px-6 lg:px-8">
	<!-- audioHeader -->
	<div class="top-0 z-50 w-full bg-[var(--bg-color)]">
		<AudioHeader {audioFiles} />
	</div>

	<!-- programm -->
	<div class="group relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
			'programm'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("programm")}>
			{eventsTitle}
		</button>
		{#if expandedSection === "programm"}
			<div class="bg-[var(--bg-color)]" transition:slide>
				<Programm {events} bind:selectedYear={programmYear} />
			</div>
		{/if}
	</div>

	<div class="relative w-full border-b-2 border-[var(--text-color)]">
		<button
			class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
			'aufnahmen'
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleSection("aufnahmen")}>
			{recordingsTitle}
		</button>
		{#if expandedSection === "aufnahmen"}
			<div class="bg-[var(--bg-color)]" transition:slide>
				<Aufnahmen {audioFiles} bind:selectedYear={aufnahmenYear} />
			</div>
		{/if}
	</div>

	<!-- Dynamic Sections -->
	{#each dynamicSections as section (section.id)}
		<div class="relative w-full border-b-2 border-[var(--text-color)]">
			<button
				class="relative z-20 flex w-full cursor-pointer items-center justify-between p-4 text-left text-4xl font-bold uppercase transition-colors duration-300 md:text-8xl lg:text-9xl {expandedSection ===
				section.slug
					? 'bg-[var(--text-color)] text-[var(--bg-color)]'
					: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
				onclick={() => toggleSection(section.slug)}>
				{section.title}
			</button>
			{#if expandedSection === section.slug}
				<div class="bg-[var(--bg-color)]" transition:slide>
					{#if section.type === "headerSection"}
						<Info infoPages={section.content} />
					{:else if section.type === "mainSection"}
						<Club page={section.content} />
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
