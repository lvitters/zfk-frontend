<script lang="ts">
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";
	import NavBottomPortal from '$lib/NavBottomPortal.svelte';
	import { getNavHeight } from "$lib/layoutState.svelte";

	let { data } = $props();

	// Calculate events once from data.events, handling potential undefined data.events
	const events = (data.events || []).map((e) => {
		let displayDate = e.formattedDate;
		let displayTime = '';
		if (e.formattedEndDate && e.formattedEndDate !== e.formattedDate) {
			displayDate += ` - ${e.formattedEndDate}`;
		}
		if (e.time) {
			const timeParts = e.time.split(":");
			displayTime = timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : e.time;
		}
		return {
			...e,
			year: new Date(e.date).getFullYear(),
			displayDate,
			displayTime,
			fullText: e.text,
		};
	});

	// extract unique years and sort them in ascending order
	const years = Array.from(new Set(events.map((event) => event.year))).sort((a, b) => Number(a) - Number(b));

	// get the current year
	const currentYear = new Date().getFullYear();

	let selectedYear = $state<number>(currentYear);

	let eventRefs = new Map<string, HTMLElement>();

	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			}
		}
	}

	const scrollOffset = 20; // Define a small gap in pixels

	function selectYear(year: number) {
		selectedYear = year;
		const firstEventOfYear = events.find((e) => e.year === year);
		if (firstEventOfYear) {
			const el = eventRefs.get(firstEventOfYear.id);
			if (el) {
                const navHeight = getNavHeight();
                const y = el.getBoundingClientRect().top + window.scrollY - navHeight - scrollOffset; // Adjusted calculation
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
		}
	}

	let expandedEventId = $state<string | null>(null);

	function toggleEvent(id: string) {
		if (expandedEventId === id) {
			expandedEventId = null;
		} else {
			expandedEventId = id;
			// Wait for the closing animation to finish (approx 200ms) plus a small buffer
			setTimeout(() => {
				if (expandedEventId && eventRefs.has(expandedEventId)) {
					const el = eventRefs.get(expandedEventId);
                    if (el) {
                        const navHeight = getNavHeight();
                        const y = el.getBoundingClientRect().top + window.scrollY - navHeight - scrollOffset; // Adjusted calculation
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
				}
			}, 250);
		}
	}

	function closeEvent(e: Event) {
		e.stopPropagation();
		expandedEventId = null;
	}
</script>

<NavBottomPortal>
	<YearSelect {years} year={selectedYear} {selectYear} />
</NavBottomPortal>

<div class="flex w-full flex-col gap-6">
	{#each events as event, index}
		<div class="w-full" use:addRef={event.id}>
			{#if expandedEventId === event.id}
				<!-- Expanded View -->
				<div class="flex w-full flex-col gap-3 rounded-3xl bg-black/5 dark:bg-white/5 p-6">
					<div class="flex items-center justify-between pb-4">
						<h2 class="text-2xl font-medium md:text-3xl cursor-pointer">{event.title}</h2>
						<button
							onclick={closeEvent}
							class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10"
							aria-label="Close details">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-6 w-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					
					<div class="kirby-content w-full text-base leading-relaxed md:text-lg">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html event.fullText}
					</div>
				</div>
			{:else}
				<!-- Preview Row -->
				<div class="flex w-full {index % 2 !== 0 ? 'justify-end' : 'justify-start'}">
					<div
						class="flex w-fit max-w-full items-center gap-6 p-4 {index % 2 !== 0 ? 'flex-row-reverse text-right' : 'flex-row text-left'}">
						
						<!-- Image Side -->
						<button 
							class="w-[33vw] shrink-0 md:w-[25vw] cursor-pointer transition-opacity hover:opacity-80 focus:outline-none"
							onclick={() => toggleEvent(event.id)}>
							{#if event.thumbnailUrl}
								<img
									src={event.thumbnailUrl}
									alt={event.title}
									class="h-auto w-full rounded-lg object-contain"
								/>
							{:else if event.videoUrl}
								<video
									src={event.videoUrl}
									class="h-auto w-full rounded-lg object-contain"
									autoplay
									muted
									loop
									playsinline>
								</video>
							{:else}
								<div class="aspect-video w-full rounded-lg bg-gray-200 dark:bg-gray-800"></div>
							{/if}
						</button>

						<!-- Content Side -->
						<button 
							class="flex flex-1 flex-col justify-center gap-2 cursor-pointer transition-opacity hover:opacity-80 focus:outline-none {index % 2 !== 0 ? 'items-end text-right' : 'items-start text-left'}"
							onclick={() => toggleEvent(event.id)}>
							<div class="opacity-70">
								<div class="text-base">{event.displayDate}</div>
								{#if event.displayTime}
									<div class="text-sm">{event.displayTime}</div>
								{/if}
							</div>
							<h2 class="text-xl font-medium md:text-2xl">{event.title}</h2>
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>
