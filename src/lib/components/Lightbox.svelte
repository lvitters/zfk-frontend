<script lang="ts">
	import { setLightboxImage, getLightboxImage } from "$lib/layoutState.svelte";
	import { fade } from "svelte/transition";

	let imageUrl = $derived(getLightboxImage());

	function close(event?: MouseEvent) {
		if (event) {
			event.stopPropagation();
		}
		setLightboxImage(null);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			close();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if imageUrl}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
		onclick={close}
		transition:fade={{ duration: 200 }}>
		<button
			class="absolute top-4 right-4 z-[100] cursor-pointer p-2 text-4xl leading-none text-white hover:text-gray-300 focus:outline-none"
			aria-label="Close">
			&times;
		</button>

		<img src={imageUrl} alt="Fullscreen view" class="max-h-[95vh] max-w-[95vw] object-contain" />
	</div>
{/if}
