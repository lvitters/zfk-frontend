<!-- tailwindcss -->
<script>
	import { page } from "$app/stores"; // import page store
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
	import { setNavBottom, setNavHeight } from "$lib/layoutState.svelte"; // Updated import

	let isNavOpen = $state(true);
	let topSectionHeight = $state(0);
	let bottomSectionHeight = $state(0);

	let fullNavHeight = $derived(topSectionHeight + bottomSectionHeight);
	const navClosedPaddingTop = 20; // Additional space above page select when nav is closed

	let currentVisibleNavHeight = $state(0);

	$effect(() => {
		currentVisibleNavHeight = isNavOpen ? fullNavHeight : bottomSectionHeight + navClosedPaddingTop;
		setNavHeight(currentVisibleNavHeight);
	});
</script>

<div 
	class="fixed top-0 left-0 z-50 w-full overflow-hidden"
	style="height: {isNavOpen ? fullNavHeight : bottomSectionHeight + navClosedPaddingTop}px;">
	
	<!-- Inner container for sliding effect -->
	<div 
		class="w-full bg-white/95 backdrop-blur-md dark:bg-black/95 border-b border-black/5 dark:border-white/5 shadow-sm"
		style="transform: translateY({isNavOpen ? 0 : -topSectionHeight}px)">
		
		<div class="mx-auto w-full max-w-[1000px] px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3">
			<Nav bind:isOpen={isNavOpen} bind:topSectionHeight={topSectionHeight} bind:bottomSectionHeight={bottomSectionHeight} />
		</div>
	</div>
</div>

	<div 
		class="mx-auto w-full max-w-[1000px] px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3"
		style="padding-top: {isNavOpen ? fullNavHeight + 40 : bottomSectionHeight + navClosedPaddingTop + 40}px;
           padding-bottom: max(0px, calc(100vh - {currentVisibleNavHeight}px - 40px));"> <!-- Dynamic padding-bottom -->
		{@render children()}
	</div>
<svelte:head>
	<style>
		:root {
			--nav-height: {$fullNavHeight}px;
		}
	</style>
</svelte:head>
