<script lang="ts">
	import "$lib/css/fonts.css";
	let { page } = $props();
</script>

<div class="kirby-content w-full p-4 text-base leading-relaxed md:text-lg">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html page.text}
</div>
