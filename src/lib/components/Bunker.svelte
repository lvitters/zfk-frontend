<script lang="ts">
	let { page } = $props();
</script>

<!-- main content section displaying html text from cms -->
<div class="kirby-content w-full p-4 text-base leading-relaxed md:px-6 md:text-lg">
	<!-- custom hardcoded content -->
	<div
		class="mb-4 cursor-pointer border-2 border-[var(--text-color)] bg-[var(--text-color)]"
		style="width: min(100%, 70ch);">
		<img
			src="/bunker2.jpg"
			alt="isometric ZfK bunker"
			class="h-auto w-full mix-blend-difference contrast-125 grayscale" />
	</div>

	<!-- continue exactly like MainSections -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html page.text}
</div>
