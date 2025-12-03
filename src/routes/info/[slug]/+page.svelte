<script lang="ts">
	let { data } = $props();
</script>

<div class="kirby-content mt-4 ml-7 space-y-4 text-xl">
	{#if data.page}
		<!-- Render the title if needed, though usually it's part of the text or header -->
		<!-- <h1 class="text-2xl font-bold">{data.page.title}</h1> -->
		{@html data.page.text}
	{/if}
</div>
