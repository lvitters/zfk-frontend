<script lang="ts">
	import Lightbox from "$lib/components/Lightbox.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { lightboxImage } from "$lib/stores";
	let { children } = $props();
	import "../app.css";

	function handleGlobalClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		// check if the clicked element is an image and has a src
		if (target.tagName === "IMG" && (target as HTMLImageElement).src) {
			// check if it's already inside the lightbox to prevent closing/re-opening issues
			// the lightbox container has specific classes we can check for, or just check context
			if (target.closest(".fixed.inset-0.z-\\[100\\]") || target.closest(".fixed.inset-0.z-50")) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			lightboxImage.set((target as HTMLImageElement).src);
		}
	}
</script>

<svelte:window onclick={handleGlobalClick} />

<div class="flex min-h-screen w-full flex-col bg-[var(--bg-color)]">
	<Lightbox />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
