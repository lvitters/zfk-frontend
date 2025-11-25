<script>
	import { page } from "$app/stores";
	let { children } = $props();
</script>

<div class="mt-4 mb-8 ml-7 flex gap-6 text-xl">
	<a href="/info" class="cursor-pointer hover:underline" class:underline={$page.url.pathname === "/info"}>Über Uns</a>
	<a
		href="/info/selbstverstaendnis"
		class="cursor-pointer hover:underline"
		class:underline={$page.url.pathname.startsWith("/info/selbstverstaendnis")}>
		Selbstverständnis
	</a>
	<a
		href="/info/impressum"
		class="cursor-pointer hover:underline"
		class:underline={$page.url.pathname.startsWith("/info/impressum")}>
		Impressum
	</a>
</div>

{@render children()}
