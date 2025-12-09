<!-- tailwindcss -->
<script>
	import { page } from "$app/stores"; // import page store
	let { children } = $props();
	import "../app.css";
	import Nav from "./nav.svelte";
	import { setNavBottom } from "$lib/layoutState.svelte";

	let isNavOpen = $state(true);
	let topSectionHeight = $state(0);
	let bottomSectionHeight = $state(0);

	let fullNavHeight = $derived(topSectionHeight + bottomSectionHeight);
	const navClosedPaddingTop = 20; // Additional space above page select when nav is closed
</script>

<div 
	class="fixed top-0 left-0 z-50 w-full overflow-hidden transition-[height] duration-500 ease-in-out"
	style="height: {isNavOpen ? fullNavHeight : bottomSectionHeight + navClosedPaddingTop}px;">
	
	<!-- Inner container for sliding effect -->
	<div 
		class="w-full bg-white/95 backdrop-blur-md dark:bg-black/95 border-b border-black/5 dark:border-white/5 shadow-sm transition-transform duration-500 ease-in-out"
		style="transform: translateY({isNavOpen ? 0 : -topSectionHeight}px)">
		
		<div class="mx-auto w-full max-w-[1000px] px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3">
			<Nav bind:isOpen={isNavOpen} bind:topSectionHeight={topSectionHeight} bind:bottomSectionHeight={bottomSectionHeight} />
		</div>
	</div>
</div>

<div 
	class="mx-auto w-full max-w-[1000px] overflow-hidden px-5 text-sm md:w-3/4 md:px-0 md:text-base lg:w-2/3"
	style="padding-top: {isNavOpen ? fullNavHeight + 40 : bottomSectionHeight + navClosedPaddingTop + 40}px">
	{@render children()}
</div>
