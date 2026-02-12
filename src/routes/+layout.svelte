<script lang="ts">
	import Lightbox from "$lib/components/Lightbox.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import { lightboxImage, isDarkMode } from "$lib/stores";
	import { onMount } from "svelte";
	import { afterNavigate } from "$app/navigation";
	let { children } = $props();
	import "../app.css";

	// set init theme (darkMode)
	onMount(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		isDarkMode.set(mediaQuery.matches);
		const handler = (e: MediaQueryListEvent) => isDarkMode.set(e.matches);
		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	});

	// open lightbox
	function handleGlobalClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		// check if the clicked element is an image and has a src
		if (target.tagName === "IMG" && (target as HTMLImageElement).src) {
			// check if it's already inside the lightbox to prevent closing/re-opening issues
			// the lightbox container has specific classes we can check for, or just check context
			if (target.closest(".fixed.inset-0.z-\\[100\\]") || target.closest(".fixed.inset-0.z-50")) {
				return;
			}

			// ignore images inside links or buttons
			if (target.closest("a") || target.closest("button")) {
				return;
			}

			event.stopPropagation();
			lightboxImage.set((target as HTMLImageElement).src);
		}
	}

	// theme toggle reaction
	$effect(() => {
		document.documentElement.style.setProperty("--bg-lightness", $isDarkMode ? "10%" : "90%");
		document.documentElement.style.setProperty("--text-lightness", $isDarkMode ? "90%" : "10%");
	});

	// hue update
	let currentHue = 210;
	const updateHue = () => {
		const targetHue = Math.floor(Math.random() * 360);
		// calculate shortest path (diff between -180 and 180)
		const diff = ((targetHue - (currentHue % 360) + 540) % 360) - 180;
		currentHue += diff;
		document.documentElement.style.setProperty("--bg-hue", currentHue.toString());
	};

	onMount(() => {
		// sync currentHue with the random value set in app.html
		const style = getComputedStyle(document.documentElement);
		currentHue = parseInt(style.getPropertyValue("--bg-hue")) || 210;

		// start first transition immediately
		updateHue();

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		isDarkMode.set(mediaQuery.matches);
		const handler = (e: MediaQueryListEvent) => isDarkMode.set(e.matches);
		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	});

	$effect(() => {
		// interval in millis (needs to match hue transition in app.css)
		const interval = setInterval(updateHue, 60000);

		return () => clearInterval(interval);
	});
</script>

<svelte:window onclick={handleGlobalClick} />

<div class="flex min-h-screen w-full flex-col bg-[var(--bg-color)]">
	<Lightbox />
	<main class="flex-grow">
		{@render children()}
	</main>
	<Footer />
</div>
