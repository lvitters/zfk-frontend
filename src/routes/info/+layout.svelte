<script lang="ts">
	import { page } from "$app/stores";
	import type { Snippet } from "svelte";

	interface InfoPageItem {
		id: string;
		title: string;
		slug: string;
	}

	let { children, data }: { children: Snippet; data: { infoPages: InfoPageItem[] } } = $props();

	import NavBottomPortal from '$lib/NavBottomPortal.svelte';
</script>

<NavBottomPortal>
	<div class="flex flex-wrap gap-3 text-sm md:gap-6 md:text-xl justify-start w-full lg:flex-col lg:items-start lg:gap-2 lg:w-auto lg:text-2xl text-glow-white">
		{#each data.infoPages as infoPage}
			<a
				href="/info/{infoPage.slug}"
				class="cursor-pointer hover:underline"
				class:underline={$page.url.pathname.startsWith(`/info/${infoPage.slug}`)}>
				{infoPage.title}
			</a>
		{/each}
	</div>
</NavBottomPortal>

{@render children()}
