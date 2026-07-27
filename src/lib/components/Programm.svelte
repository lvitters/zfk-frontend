<script lang="ts">
	import YearSelect from "$lib/components/YearSelect.svelte";
	import { onMount, tick } from "svelte";
	import { slide } from "svelte/transition";
	import type { ProgrammEvent } from "$lib/types";

	let {
		events: rawEvents,
		selectedYear = $bindable(),
		parentSlug,
	}: { events: ProgrammEvent[] | null; selectedYear?: number; parentSlug?: string } = $props();

	function extractFirstImageAttributes(html: string): { src?: string; srcset?: string; sizes?: string } | null {
		if (!html) return null;
		const imgMatch = html.match(/<img[^>]+>/i);
		if (!imgMatch) return null;

		const imgTag = imgMatch[0];
		const getAttr = (name: string) => {
			const match = imgTag.match(new RegExp(`${name}=(['"])(.*?)\\1`, "i"));
			return match ? match[2] : undefined;
		};

		const src = getAttr("src");
		if (src) {
			return {
				src,
				srcset: getAttr("srcset"),
				sizes: getAttr("sizes"),
			};
		}
		return null;
	}

	// calculate events once
	const events = $derived(
		(rawEvents || []).map((e: ProgrammEvent) => {
			let displayDate = e.formattedDate.split(".").slice(0, 2).join(".") + ".";
			let displayTime = "";
			if (e.formattedEndDate && e.formattedEndDate !== e.formattedDate) {
				displayDate += ` - ${e.formattedEndDate.split(".").slice(0, 2).join(".") + "."}`;
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
				firstImageAttrs: e.text ? extractFirstImageAttributes(e.text) : null,
			};
		}),
	);

	// extract unique years
	const years = $derived(
		Array.from(new Set(events.map((event: ProgrammEvent) => event.year))).sort(
			(a: number, b: number) => Number(b) - Number(a),
		),
	);

	$effect(() => {
		if (!selectedYear && years.length > 0) {
			selectedYear = years[0] as number;
		}
	});

	let filteredEvents = $derived(events.filter((e: ProgrammEvent) => e.year === selectedYear));

	let eventRefs = new Map<string, HTMLElement>();
	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			},
		};
	}

	let listContainer = $state<HTMLElement | null>(null);
	let innerContainer = $state<HTMLElement | null>(null);
	let transitionTimeout: ReturnType<typeof setTimeout> | null = null;

	// select a year and smoothly animate the container height change
	async function selectYear(year: number) {
		if (year === selectedYear) return;

		// 1. lock current height
		if (listContainer) {
			const currentHeight = listContainer.offsetHeight;
			listContainer.style.height = `${currentHeight}px`;
		}

		expandedEventId = null;
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

	let expandedEventId = $state<string | null>(null);
	let isEntryHovered = $state<boolean[]>([]);
	let nextUpEventId = $state<string | null>(null);

	onMount(() => {
		isEntryHovered = Array(events.length).fill(false);

		const now = new Date();
		let nextUp = null;
		let minDiff = Infinity;

		for (const e of events) {
			const eventDate = new Date(e.date);
			if (e.time) {
				const timeParts = e.time.split(":");
				if (timeParts.length >= 2) {
					eventDate.setHours(parseInt(timeParts[0], 10), parseInt(timeParts[1], 10), 0, 0);
				}
			} else {
				eventDate.setHours(23, 59, 59, 999);
			}

			const diff = eventDate.getTime() - now.getTime();
			if (diff > -10800000) {
				// 3 hours grace period
				if (diff < minDiff) {
					minDiff = diff;
					nextUp = e.id;
				}
			}
		}

		nextUpEventId = nextUp;

		const hash = window.location.hash.slice(1);
		if (hash) {
			const eventToExpand = events.find((e: ProgrammEvent) => e.slug === hash);
			if (eventToExpand) {
				selectedYear = eventToExpand.year;
				expandedEventId = eventToExpand.id;
			}
		}
	});

	// toggle the expanded state of a single event
	function toggleEvent(event: ProgrammEvent) {
		if (expandedEventId === event.id) {
			expandedEventId = null;
			if (parentSlug) {
				history.replaceState(null, "", `#${parentSlug}`);
			} else {
				history.replaceState(null, "", window.location.pathname + window.location.search);
			}
		} else {
			expandedEventId = event.id;
			history.replaceState(null, "", `#${event.slug}`);
		}
	}
</script>

{#snippet previewRow(event: ProgrammEvent, index: number)}
	<!-- preview row for event list -->
	<div class="flex w-full justify-start">
		<button
			class="relative flex w-full cursor-pointer flex-col overflow-hidden p-3 text-left focus:outline-none md:px-6
			{nextUpEventId === event.id
				? expandedEventId === event.id
					? 'bg-(--highlight-color) text-(--dark-color)'
					: 'bg-(--highlight-color) text-(--dark-color) hover:bg-(--text-color) hover:text-(--bg-color)'
				: expandedEventId === event.id
					? 'bg-(--text-color) text-(--bg-color)'
					: 'hover:bg-(--text-color) hover:text-(--bg-color)'}"
			onclick={() => toggleEvent(event)}
			onmouseenter={() => (isEntryHovered[index] = true)}
			onmouseleave={() => (isEntryHovered[index] = false)}>
			<!-- content -->
			<div class="flex w-full flex-col gap-1">
				<div
					class="flex shrink-0 flex-wrap items-center gap-3 text-[clamp(1rem,3vw,1.5rem)] leading-none tabular-nums md:gap-5 {nextUpEventId ===
					event.id
						? ''
						: 'opacity-85'}">
					<span>
						{event.displayDate}
					</span>

					{#if event.displayTime}
						<span>
							{event.displayTime}
						</span>
					{/if}

					{#if nextUpEventId === event.id}
						<span class="animate-pulse-opacity ml-2 font-bold uppercase md:ml-4">NEXT</span>
					{/if}
				</div>
				<!-- title -->
				<div class="mt-1 text-[clamp(1rem,3vw,1.5rem)] leading-none font-medium">
					{event.title}
				</div>
			</div>
		</button>
	</div>
{/snippet}

{#snippet expandedEventContent(event: ProgrammEvent)}
	<!-- expanded details view for an event -->
	<div class="expanded-event-container flex w-full flex-col gap-6 p-3 md:px-6" transition:slide>
		<!-- event text -->
		<div class="kirby-content w-full text-base leading-relaxed md:text-lg">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html event.fullText}
		</div>
	</div>
{/snippet}

<div class="flex w-full flex-col">
	<YearSelect {years} year={selectedYear} {selectYear} />

	<!-- events -->
	<div bind:this={listContainer} class="w-full overflow-hidden transition-[height] duration-300 ease-in-out">
		<div bind:this={innerContainer} class="w-full">
			{#each filteredEvents as event, index}
				<div
					id={event.slug}
					class="event-row w-full border-b-2 border-(--text-color) last:border-b-0"
					use:addRef={event.id}>
					{@render previewRow(event, index)}
					{#if expandedEventId === event.id}
						{@render expandedEventContent(event)}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<!-- preload images for the selected year so they appear immediately on expand -->
<svelte:head>
	{#each filteredEvents as event}
		{#if event.firstImageAttrs}
			<link
				rel="preload"
				as="image"
				href={event.firstImageAttrs.src}
				imagesrcset={event.firstImageAttrs.srcset}
				imagesizes={event.firstImageAttrs.sizes} />
		{/if}
	{/each}
</svelte:head>
