<!-- tailwindcss -->
<script>
	import { page } from "$app/stores"; // import page store
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
</script>

<div class="mx-auto w-full max-w-[1000px] px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3">
	{#if !$page.url.pathname.startsWith("/admin")}
		<Nav />
	{/if}

	{@render children()}
</div>
