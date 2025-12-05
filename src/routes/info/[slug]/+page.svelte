<script lang="ts">
	let { data } = $props();
</script>

<div class="kirby-content mt-0 space-y-4 text-sm md:mt-0 md:text-xl pb-6">
	{#if data.page}
		<!-- render the title if needed, though usually it's part of the text or header -->
		<!-- <h1 class="text-2xl font-bold">{data.page.title}</h1> -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.page.text}
	{/if}
</div>
