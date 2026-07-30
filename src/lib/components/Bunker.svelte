<script lang="ts">
	let { page } = $props();
</script>

<!-- main content section displaying html text from cms -->
<div class="kirby-content w-full p-4 text-base leading-relaxed md:px-6 md:text-lg">
	<!-- continue exactly like MainSections -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html page.text}
	<!-- custom hardcoded content -->
	<div class="mb-4 cursor-pointer border-0 border-(--text-color) bg-(--bg-color)" style="width: min(100%, 70ch);">
		<img
			src="/bunker_freigestellt.png"
			alt="isometric drawing of ZfK bunker"
			class="h-auto w-full mix-blend-difference contrast-125 drop-shadow-[0px_4px_10px_rgba(255,255,255,1)] grayscale" />
	</div>
</div>
