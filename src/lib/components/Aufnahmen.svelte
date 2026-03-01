<script lang="ts">
	import { audioController } from "$lib/audioController.svelte";
	import YearSelect from "$lib/components/YearSelect.svelte";
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
		audioController.play(track);
	}
</script>

<!-- display files list container -->
<div class="flex w-full flex-col">
	<!-- year select header -->
	<div class="w-full border-b-2 border-(--text-color) p-2 md:px-4">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	<div bind:this={listContainer} class="w-full overflow-hidden transition-[height] duration-300 ease-in-out">
		<div bind:this={innerContainer} class="w-full">
			{#each filteredAudioFiles as file}
				{@const isActive = file.id === audioController.currentTrack?.id}
				<!-- individual file row -->
				<button
					class="group/row relative flex w-full cursor-pointer flex-col gap-1 border-b-2 border-(--text-color) p-4 text-left last:border-b-0 md:px-6 {isActive
						? 'bg-(--text-color) text-(--bg-color)'
						: 'hover:bg-(--text-color) hover:text-(--bg-color)'}"
					onclick={() => {
						if (isActive) {
							audioController.toggle();
						} else {
							selectTrack(file);
						}
					}}>
					<!-- date row -->
					<div
						class="flex shrink-0 items-center gap-5 text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums opacity-85">
						<span>
							{file.sortDate.split("-")[2]}.{file.sortDate.split("-")[1]}.
						</span>
						{#if file.isExternal}
							<!-- SoundCloud logo aligned to the right of the date -->
							<a
								href={file.externalUrl}
								target="_blank"
								rel="noopener noreferrer"
								onclick={(e) => {
									e.stopPropagation(); // prevent selectTrack from being called when clicking the logo
								}}
								class="group/icon pointer-events-auto inline-flex items-center"
								style="height: 1em; width: 1.6em; transform: translateY(-0.12em) scale(2);"
								aria-label="Listen on SoundCloud">
								<div
									class="h-full w-full {isActive
										? 'bg-(--bg-color)'
										: 'bg-(--text-color) group-hover/row:bg-(--bg-color)'} group-hover/icon:bg-(--highlight-color)!"
									style="
										mask-image: url('/soundcloud_icon_white_transparent.png');
										-webkit-mask-image: url('/soundcloud_icon_white_transparent.png');
										mask-size: contain;
										-webkit-mask-size: contain;
										mask-repeat: no-repeat;
										-webkit-mask-repeat: no-repeat;
										mask-position: center;
										-webkit-mask-position: center;
									">
								</div>
							</a>
						{/if}
					</div>
					<!-- title -->
					<div class="text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
						{file.title}
					</div>
				</button>
			{/each}
		</div>
	</div>
</div>
