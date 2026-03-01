<script lang="ts">
	import { slide } from "svelte/transition";
	let { items } = $props();
	let expandedId = $state<string | null>(null);

	// toggle the expanded state of a section
	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<div class="flex w-full flex-col">
	{#each items as item}
		<!-- individual section with expandable content -->
		<div class="border-b-2 border-(--text-color) last:border-b-0">
			<button
				class="flex w-full cursor-pointer items-center justify-between p-4 text-left text-2xl font-medium focus:outline-none md:px-6 md:text-3xl lg:text-4xl {expandedId ===
				item.id
					? 'bg-(--text-color) text-(--bg-color)'
					: 'bg-(--bg-color) hover:bg-(--text-color) hover:text-(--bg-color)'}"
				onclick={() => toggle(item.id)}>
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
