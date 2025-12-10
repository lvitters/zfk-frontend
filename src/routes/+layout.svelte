<script>
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
	import { setNavHeight } from "$lib/layoutState.svelte";
	import { page } from "$app/stores";

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

<div class="lg:flex lg:h-screen lg:flex-row lg:overflow-hidden">
	<div
		class="fixed left-0 top-0 z-50 w-full overflow-hidden lg:!static lg:!h-full lg:!w-1/4 lg:!overflow-visible lg:!border-r lg:!border-black/5 lg:bg-white/50 lg:backdrop-blur-md"
		style="height: {isNavOpen ? fullNavHeight : bottomSectionHeight}px;">
		<!-- inner container for sliding effect -->
		<div
			class="w-full border-b border-black/5 bg-white/50 shadow-sm backdrop-blur-md lg:!h-full lg:!transform-none lg:!border-none lg:!bg-transparent lg:!shadow-none lg:!backdrop-blur-none lg:overflow-y-auto"
			style="transform: translateY({isNavOpen ? 0 : -topSectionHeight}px)">
			<div
				class="mx-auto w-full max-w-[1000px] px-5 text-base lg:!h-full lg:!w-full lg:!max-w-none lg:!px-8 lg:!py-8">
				<Nav bind:isOpen={isNavOpen} bind:topSectionHeight bind:bottomSectionHeight />
			</div>
		</div>
	</div>

	<div
		class="mx-auto w-full max-w-[1000px] px-5 text-sm md:text-base lg:!h-full lg:!w-auto lg:!flex-1 lg:!max-w-none lg:!mx-0 lg:!overflow-y-auto lg:!px-8 lg:!py-8"
		style="padding-top: {isNavOpen ? fullNavHeight + 40 : bottomSectionHeight + 40}px;
           padding-bottom: max(0px, calc(100vh - {currentVisibleNavHeight}px - 40px));">
		<!-- dynamic padding-bottom -->
		<div
			class="mx-auto lg:w-2/3 {$page.url.pathname.startsWith('/veranstaltungen')
				? 'w-3/4'
				: 'w-full'}">
			{@render children()}
		</div>
	</div>
</div>
<svelte:head>
	<style>
		:root {
			--nav-height: {$fullNavHeight}px;
		}
	</style>
</svelte:head>
