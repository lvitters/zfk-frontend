<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<div class="mt-0 mb-4 flex flex-wrap gap-3 text-sm md:mt-0 md:gap-6 md:text-xl">
	{#each years as year}
		<button
			class="cursor-pointer hover:underline"
			class:underline={year === selectedYear}
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
