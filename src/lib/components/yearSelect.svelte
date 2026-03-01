<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<!-- horizontal list of year buttons for filtering content -->
<div class="flex w-full flex-wrap items-center gap-4 text-[clamp(1rem,3vw,1.5rem)] leading-none">
	{#each years || [] as year}
		<button
			class="cursor-pointer p-1 whitespace-nowrap hover:bg-(--text-color) hover:text-(--bg-color) {year ===
			selectedYear
				? 'bg-(--text-color) text-(--bg-color)'
				: ''}"
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
