<script lang="ts">
	import AudioHeader from "$lib/components/AudioHeader.svelte";
	import Aufnahmen from "$lib/components/Aufnahmen.svelte";
	import Programm from "$lib/components/Programm.svelte";
	import Club from "$lib/components/MainSection.svelte";
	import Info from "$lib/components/HeaderSection.svelte";
	import { slide, fade } from "svelte/transition";
	import { onMount } from "svelte";

	let { data } = $props();
	let { events, audioFiles, dynamicSections, eventsTitle, recordingsTitle } = data;

	let expandedSection = $state(null as string | null);
	let programmYear = $state<number | undefined>();
	let aufnahmenYear = $state<string | undefined>();
	let visible = $state(false);

	onMount(() => {
		visible = true;
	});

	// toggle the expanded state of a section by its slug
	function toggleSection(sectionSlug: string) {
		if (expandedSection === sectionSlug) {
			expandedSection = null;
		} else {
			expandedSection = sectionSlug;
		}
	}
</script>

<!-- fade in everything when content has loaded -->
{#if visible}
	<div transition:fade={{ duration: 500 }} class="flex min-h-screen w-full flex-col px-2 md:px-6 lg:px-8">
		<!-- AudioHeader component -->
		<div class="top-0 z-50 w-full bg-[var(--bg-color)]">
			<AudioHeader {audioFiles} />
		</div>

		<!-- programm (events) section -->
		<div class="group relative w-full border-b-2 border-[var(--text-color)]">
			<button
				class="relative z-20 flex w-full cursor-pointer items-center py-2 pl-2 text-left text-[clamp(3rem,13vw,12rem)] font-bold leading-none md:px-4 {expandedSection ===
				'programm'
					? 'bg-[var(--text-color)] text-[var(--bg-color)]'
					: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
				onclick={() => toggleSection("programm")}>
				{eventsTitle}
			</button>
			{#if expandedSection === "programm"}
				<div transition:slide>
					<Programm {events} bind:selectedYear={programmYear} />
				</div>
			{/if}
		</div>

		<!-- aufnahmen (recordings) section -->
		<div class="relative w-full border-b-2 border-[var(--text-color)]">
			<button
				class="relative z-20 flex w-full cursor-pointer items-center py-2 pl-2 text-left text-[clamp(3rem,13vw,12rem)] font-bold leading-none md:px-4 {expandedSection ===
				'aufnahmen'
					? 'bg-[var(--text-color)] text-[var(--bg-color)]'
					: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
				onclick={() => toggleSection("aufnahmen")}>
				{recordingsTitle}
			</button>
			{#if expandedSection === "aufnahmen"}
				<div transition:slide>
					<Aufnahmen {audioFiles} bind:selectedYear={aufnahmenYear} />
				</div>
			{/if}
		</div>

		<!-- dynamic sections (cms pages) -->
		{#each dynamicSections as section (section.id)}
			<div class="relative w-full border-b-2 border-[var(--text-color)]">
				<button
					class="relative z-20 flex w-full cursor-pointer items-center py-2 pl-2 text-left text-[clamp(3rem,13vw,12rem)] font-bold leading-none md:px-4 {expandedSection ===
					section.slug
						? 'bg-[var(--text-color)] text-[var(--bg-color)]'
						: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
					onclick={() => toggleSection(section.slug)}>
					{section.title}
				</button>
				{#if expandedSection === section.slug}
					<div transition:slide>
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
{/if}
