<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<!-- horizontal list of year buttons for filtering content -->
<div class="w-full border-b-2 border-(--text-color) p-2 pr-0 md:px-4">
	<div class="no-scrollbar flex w-full items-center gap-4 overflow-x-auto text-[clamp(1rem,3vw,1.5rem)] leading-none">
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
</div>

<style>
	.no-scrollbar {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari and Opera */
	}
</style>
