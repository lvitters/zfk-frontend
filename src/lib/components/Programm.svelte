<script lang="ts">
	import YearSelect from "$lib/components/YearSelect.svelte";
	import { onMount, tick } from "svelte";
	import { slide } from "svelte/transition";
	import type { ProgrammEvent } from "$lib/types";

	let { events: rawEvents, selectedYear = $bindable() }: { events: ProgrammEvent[] | null; selectedYear?: number } =
		$props();

	// calculate events once
	const events = (rawEvents || []).map((e: ProgrammEvent) => {
		let displayDate = e.formattedDate.split(".").slice(0, 2).join(".");
		let displayTime = "";
		if (e.formattedEndDate && e.formattedEndDate !== e.formattedDate) {
			displayDate += ` - ${e.formattedEndDate.split(".").slice(0, 2).join(".")}`;
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

	// extract unique years
	const years = Array.from(new Set(events.map((event: ProgrammEvent) => event.year))).sort(
		(a: number, b: number) => Number(b) - Number(a),
	);

	if (!selectedYear && years.length > 0) {
		selectedYear = years[0] as number;
	}

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

	onMount(() => {
		isEntryHovered = Array(events.length).fill(false);
	});

	// toggle the expanded state of a single event
	function toggleEvent(id: string) {
		if (expandedEventId === id) {
			expandedEventId = null;
		} else {
			expandedEventId = id;
		}
	}
</script>

{#snippet previewRow(event: ProgrammEvent, index: number)}
	<!-- preview row for event list -->
	<div class="flex w-full justify-start">
		<button
			class="relative flex w-full cursor-pointer flex-col overflow-hidden p-4 text-left focus:outline-none md:px-6 {expandedEventId ===
			event.id
				? 'bg-[var(--text-color)] text-[var(--bg-color)]'
				: 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleEvent(event.id)}
			onmouseenter={() => (isEntryHovered[index] = true)}
			onmouseleave={() => (isEntryHovered[index] = false)}>
			<!-- content -->
			<div class="flex w-full flex-col gap-1">
				<div class="shrink-0 text-[clamp(1rem,3vw,1.5rem)] leading-none opacity-85">
					<span class="mr-auto md:mr-2">
						{event.displayDate}
					</span>

					{#if event.displayTime}
						<span class="ml-1">
							{event.displayTime}
						</span>
					{/if}
				</div>
				<!-- title -->
				<div class="text-[clamp(1rem,3vw,1.5rem)] font-medium leading-none">
					{event.title}
				</div>
			</div>
		</button>
	</div>
{/snippet}

{#snippet expandedEventContent(event: ProgrammEvent)}
	<!-- expanded details view for an event -->
	<div class="expanded-event-container flex w-full flex-col gap-6 p-4 md:px-6" transition:slide>
		<!-- event text -->
		<div class="kirby-content w-full text-base leading-relaxed md:text-lg">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html event.fullText}
		</div>
	</div>
{/snippet}

<div class="flex w-full flex-col">
	<!-- year select row -->
	<div class="w-full border-b-2 border-[var(--text-color)] p-4 md:px-6">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	<div bind:this={listContainer} class="w-full overflow-hidden transition-[height] duration-300 ease-in-out">
		<div bind:this={innerContainer} class="w-full">
			{#each filteredEvents as event, index}
				<div
					class="event-row w-full border-b-2 border-[var(--text-color)] last:border-b-0"
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
