<script lang="ts">
	let { data } = $props();
</script>

<div class="kirby-content mt-4 ml-7 text-xl">
	{#if data.page}
		{@html data.page.text}
	{/if}
</div>
