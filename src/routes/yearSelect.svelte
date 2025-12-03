<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<div class="mt-4 mb-8 ml-7 flex flex-wrap gap-6 text-xl">
	{#each years as year}
		<button
			class="cursor-pointer hover:underline"
			class:underline={year === selectedYear}
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
