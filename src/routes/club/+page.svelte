<script lang="ts">
	let { data } = $props();
</script>

<div class="kirby-content mt-4 text-xl">
	{#if data.page}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html data.page.text}
	{/if}
</div>
