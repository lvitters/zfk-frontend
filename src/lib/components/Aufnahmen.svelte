<script lang="ts">
	import { audioController } from "$lib/audioController.svelte";
	import YearSelect from "$lib/components/YearSelect.svelte";
	import { soundCloudConsent, pendingConsentTrackId, pendingConsentSource } from "$lib/stores";
	import type { Track } from "$lib/types";
	import { tick } from "svelte";

	let { audioFiles, selectedYear = $bindable() }: { audioFiles: Track[]; selectedYear?: string } = $props();

	let filteredAudioFiles = $derived(audioFiles.filter((file) => file.year === selectedYear));

	// extract unique years and sort them in descending order
	const years = $derived(
		Array.from(new Set(audioFiles.map((file) => file.year))).sort((a, b) => Number(b) - Number(a)),
	);

	$effect(() => {
		if (!selectedYear && years.length > 0) {
			selectedYear = years[0];
		}
	});

	let listContainer = $state<HTMLElement | null>(null);
	let innerContainer = $state<HTMLElement | null>(null);
	let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

	// select a year and smoothly animate the container height change
	async function selectYear(year: string) {
		if (year === selectedYear) return;
		$pendingConsentTrackId = null;
		$pendingConsentSource = null;

		// 1. lock current height
		if (listContainer) {
			const currentHeight = listContainer.offsetHeight;
			listContainer.style.height = `${currentHeight}px`;
		}

		selectedYear = year;

		// 2. wait for dom update
		await tick();

		// 3. animate to new height
		if (listContainer && innerContainer) {
			const newHeight = innerContainer.offsetHeight;
			listContainer.style.height = `${newHeight}px`;

			if (transitionTimeout) clearTimeout(transitionTimeout);
			transitionTimeout = setTimeout(() => {
				if (listContainer) {
					listContainer.style.height = "auto";
				}
			}, 300); // matches duration-300
		}
	}

	// select a track to play
	function selectTrack(track: Track) {
		if (!$soundCloudConsent) {
			$pendingConsentTrackId = track.id;
			$pendingConsentSource = "list";
			return;
		}
		audioController.play(track);
	}

	async function acceptSoundCloud() {
		soundCloudConsent.set(true);
		// wait for DOM to render the iframe and for the effect to call setElements
		await tick();

		if ($pendingConsentTrackId) {
			const track = audioFiles.find((f) => f.id === $pendingConsentTrackId);
			if (track) {
				audioController.play(track);
			}
			$pendingConsentTrackId = null;
			$pendingConsentSource = null;
		}
	}
</script>

<!-- display files list container -->
<div class="flex w-full flex-col">
	<!-- year select header -->
	<YearSelect {years} year={selectedYear} {selectYear} />

	<div bind:this={listContainer} class="w-full overflow-hidden transition-[height] duration-300 ease-in-out">
		<div bind:this={innerContainer} class="w-full">
			{#each filteredAudioFiles as file}
				{@const isActive = file.id === audioController.currentTrack?.id}
				{@const isPending = file.id === $pendingConsentTrackId && $pendingConsentSource === "list"}
				<!-- individual file row -->
				<div class="relative flex w-full flex-col border-b-2 border-(--text-color) last:border-b-0">
					{#if isPending}
						<!-- invisible row to maintain exact height -->
						<div class="invisible flex w-full flex-col gap-1 p-3 md:px-6" aria-hidden="true">
							<div class="text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums opacity-85">
								{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
							</div>
							<div class="text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
								{file.title}
							</div>
						</div>
						<!-- centered prompt -->
						<div
							class="absolute inset-0 flex items-center gap-4 bg-(--text-color) p-3 text-(--bg-color) md:px-6">
							<span class="text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
								SoundCloud Dienste aktivieren?
							</span>
							<button
								onclick={acceptSoundCloud}
								class="cursor-pointer bg-(--bg-color) p-1 text-[clamp(1rem,3vw,1.5rem)] leading-none whitespace-nowrap text-(--text-color) hover:bg-(--highlight-color) active:bg-(--highlight-color)">
								JA
							</button>
							<button
								onclick={() => ($pendingConsentTrackId = null)}
								class="cursor-pointer p-1 text-[clamp(1rem,3vw,1.5rem)] leading-none whitespace-nowrap hover:text-(--highlight-color) active:text-(--highlight-color)">
								X
							</button>
						</div>
					{:else}
						<button
							class="group/row relative flex w-full cursor-pointer flex-row items-center justify-between gap-1 p-3 text-left md:px-6 {isActive
								? 'bg-(--text-color) text-(--bg-color)'
								: 'hover:bg-(--text-color) hover:text-(--bg-color)'}"
							onclick={() => {
								if (isActive) {
									audioController.toggle();
								} else {
									selectTrack(file);
								}
							}}>
							<div class="flex flex-col gap-1">
								<!-- date row -->
								<div
									class="flex shrink-0 items-center gap-5 text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums opacity-85">
									<span>
										{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
									</span>
								</div>
								<!-- title -->
								<div class="text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
									{file.title}
								</div>
							</div>
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
