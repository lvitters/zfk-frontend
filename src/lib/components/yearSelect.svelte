<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<!-- horizontal list of year buttons for filtering content -->
<div class="text-glow-white flex w-full flex-wrap items-center gap-4 text-sm md:text-xl lg:text-2xl">
	{#each years || [] as year}
		<button
			class="cursor-pointer py-1 whitespace-nowrap transition-colors hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] {year ===
			selectedYear
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: ''}"
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
