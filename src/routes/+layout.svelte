<!-- tailwindcss -->
<script>
	import { page } from "$app/stores"; // Import page store
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
</script>

{#if !$page.url.pathname.startsWith('/admin')}
	<Nav />
{/if}

{@render children()}

