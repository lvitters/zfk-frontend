<script lang="ts">
	let { data } = $props();
</script>

<div class="kirby-content mt-0 text-sm md:mt-0 md:text-xl pb-6">
	{#if data.page}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.page.text}
	{/if}
</div>
