<script lang="ts">
	import "$lib/css/fonts.css";
	import { slide } from "svelte/transition";
	let { infoPages } = $props();
	let expandedId = $state<string | null>(null);

	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}
</script>

<div class="flex w-full flex-col">
	{#each infoPages as page}
		<div class="border-b-2 border-[var(--text-color)] last:border-b-0">
			<button
				class="flex w-full cursor-pointer items-center justify-between p-4 text-left text-2xl font-medium focus:outline-none md:text-3xl lg:text-4xl {expandedId ===
				page.id
					? 'bg-[var(--text-color)] text-[var(--bg-color)]'
					: 'bg-[var(--bg-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
				onclick={() => toggle(page.id)}>
				{page.title}
			</button>
			{#if expandedId === page.id}
				<div
					class="kirby-content border-t-2 border-solid border-[var(--text-color)] p-4 text-base leading-relaxed"
					transition:slide>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html page.text}
				</div>
			{/if}
		</div>
	{/each}
</div>
