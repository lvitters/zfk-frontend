<script lang="ts">
	import AudioHeader from "$lib/components/AudioHeader.svelte";
	import Aufnahmen from "$lib/components/Aufnahmen.svelte";
	import Programm from "$lib/components/Programm.svelte";
	import Bunker from "$lib/components/Bunker.svelte";
	import MainSection from "$lib/components/MainSection.svelte";
	import HeaderSection from "$lib/components/HeaderSection.svelte";
	import { slide, fade } from "svelte/transition";
	import { onMount } from "svelte";

	let { data } = $props();
	let events = $derived(data.events);
	let audioFiles = $derived(data.audioFiles);
	let sections = $derived(data.sections);

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
		<div class="top-0 z-50 w-full bg-(--bg-color)">
			<AudioHeader {audioFiles} />
		</div>

		<!-- dynamic sections (cms pages in their ordered sequence) -->
		{#each sections as section (section.id)}
			<div class="relative w-full border-b-2 border-(--text-color)">
				<button
					class="font-clash-display relative z-20 flex w-full cursor-pointer items-center py-2 pl-2 text-left text-[clamp(2.5rem,13vw,12rem)] leading-none font-bold md:px-4 {expandedSection ===
					section.slug
						? 'bg-(--text-color) text-(--bg-color)'
						: 'bg-(--bg-color) hover:bg-(--text-color) hover:text-(--bg-color)'}"
					onclick={() => toggleSection(section.slug)}>
					{@html section.title}
				</button>
				{#if expandedSection === section.slug}
					<div transition:slide>
						{#if section.type === "events"}
							<Programm {events} bind:selectedYear={programmYear} />
						{:else if section.type === "recordings"}
							<Aufnahmen {audioFiles} bind:selectedYear={aufnahmenYear} />
						{:else if section.type === "bunker"}
							<Bunker page={section.content} />
						{:else if section.type === "headerSection"}
							<HeaderSection items={section.content} />
						{:else if section.type === "mainSection"}
							<MainSection page={section.content} />
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
