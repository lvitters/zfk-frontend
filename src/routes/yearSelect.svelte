<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<div class="flex flex-wrap gap-3 text-sm md:gap-6 md:text-xl lg:flex-col lg:items-start lg:gap-2 lg:text-2xl">
	{#each years || [] as year}
		<button
			class="cursor-pointer hover:underline"
			class:underline={year === selectedYear}
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
