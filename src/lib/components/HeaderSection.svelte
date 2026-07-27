<script lang="ts">
	import { slide } from "svelte/transition";
	import { onMount } from "svelte";
	let { items, parentSlug } = $props();
	let expandedId = $state<string | null>(null);

	onMount(() => {
		const hash = window.location.hash.slice(1);
		if (hash) {
			const child = items.find((item: any) => item.slug === hash);
			if (child) {
				expandedId = child.id;
			}
		}
	});

	// toggle the expanded state of a section
	function toggle(item: any) {
		if (expandedId === item.id) {
			expandedId = null;
			if (parentSlug) {
				history.replaceState(null, "", `#${parentSlug}`);
			} else {
				history.replaceState(null, "", window.location.pathname + window.location.search);
			}
		} else {
			expandedId = item.id;
			history.replaceState(null, "", `#${item.slug}`);
		}
	}
</script>

<div class="flex w-full flex-col">
	{#each items as item}
		<!-- individual section with expandable content -->
		<div id={item.slug} class="border-b-2 border-(--text-color) last:border-b-0">
			<button
				class="flex w-full cursor-pointer items-center justify-between p-4 text-left text-2xl font-medium focus:outline-none md:px-6 md:text-3xl lg:text-4xl {expandedId ===
				item.id
					? 'bg-(--text-color) text-(--bg-color)'
					: 'bg-(--bg-color) hover:bg-(--text-color) hover:text-(--bg-color)'}"
				onclick={() => toggle(item)}>
				{item.title}
			</button>
			{#if expandedId === item.id}
				<div
					class="kirby-content border-t-2 border-solid border-(--text-color) p-4 text-base leading-relaxed md:px-6"
					transition:slide>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html item.text}
				</div>
			{/if}
		</div>
	{/each}
</div>
