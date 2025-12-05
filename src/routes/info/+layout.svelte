<script lang="ts">
	import { page } from "$app/stores";
	import type { Snippet } from "svelte";

	interface InfoPageItem {
		id: string;
		title: string;
		slug: string;
	}

	let { children, data }: { children: Snippet; data: { infoPages: InfoPageItem[] } } = $props();
</script>

<div class="mt-4 mb-4 flex gap-6 text-xl justify-start w-full">
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
