<!-- tailwindcss -->
<script>
	import { page } from "$app/stores"; // import page store
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
</script>

<div class="mx-auto w-2/3 min-w-[500px] max-w-[1000px]">
	{#if !$page.url.pathname.startsWith("/admin")}
		<Nav />
	{/if}

	{@render children()}
</div>
