<script>
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
	import { setNavHeight } from "$lib/layoutState.svelte";

	let isNavOpen = $state(true);
	let topSectionHeight = $state(0);
	let bottomSectionHeight = $state(0);
	let fullNavHeight = $derived(topSectionHeight + bottomSectionHeight);
	let currentVisibleNavHeight = $state(0);

	$effect(() => {
		currentVisibleNavHeight = isNavOpen ? fullNavHeight : bottomSectionHeight;
		setNavHeight(currentVisibleNavHeight);
	});
</script>

<div
	class="fixed left-0 top-0 z-50 w-full overflow-hidden"
	style="height: {isNavOpen ? fullNavHeight : bottomSectionHeight}px;">
	<!-- inner container for sliding effect -->
	<div
		class="w-full border-b border-black/5 bg-white/50 shadow-sm backdrop-blur-md"
		style="transform: translateY({isNavOpen ? 0 : -topSectionHeight}px)">
		<div class="mx-auto w-full max-w-[1000px] px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3">
			<Nav bind:isOpen={isNavOpen} bind:topSectionHeight bind:bottomSectionHeight />
		</div>
	</div>
</div>

<div
	class="mx-auto w-full max-w-[1000px] px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3"
	style="padding-top: {isNavOpen ? fullNavHeight + 40 : bottomSectionHeight + 40}px;
           padding-bottom: max(0px, calc(100vh - {currentVisibleNavHeight}px - 40px));">
	<!-- dynamic padding-bottom -->
	{@render children()}
</div>
<svelte:head>
	<style>
		:root {
			--nav-height: {$fullNavHeight}px;
		}
	</style>
</svelte:head>
