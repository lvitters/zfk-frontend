<script lang="ts">
	let { years, year: selectedYear, selectYear } = $props();
</script>

<div class="mb-10 ml-12 flex flex-wrap p-4 max-md:mx-4">
	{#each years as year}
		<button
			class="m-1 cursor-pointer border-b-2 px-2 py-1"
			class:border-black={year === selectedYear}
			class:border-transparent={year !== selectedYear}
			class:hover:border-black={true}
			onclick={() => selectYear(year)}>
			{year}
		</button>
	{/each}
</div>
