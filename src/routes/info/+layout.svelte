<script>
	import { page } from "$app/stores";
	let { children, data } = $props();
</script>

<div class="mt-4 mb-8 ml-7 flex gap-6 text-xl">
	{#each data.infoPages as infoPage}
		<a
			href="/info/{infoPage.slug}"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith(`/info/${infoPage.slug}`)}>
			{infoPage.title}
		</a>
	{/each}
</div>

{@render children()}
