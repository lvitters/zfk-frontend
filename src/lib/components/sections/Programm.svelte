<script lang="ts">
	import YearSelect from "$lib/components/yearSelect.svelte";
	import "$lib/css/fonts.css";
	import { onMount } from "svelte";
	import DiagonalStrip from "$lib/DiagonalStrip.svelte";

	let { events: rawEvents, selectedYear = $bindable() } = $props();

	// calculate events once
	const events = (rawEvents || []).map((e: any) => {
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
	const years = Array.from(new Set(events.map((event: any) => event.year))).sort(
		(a: any, b: any) => Number(b) - Number(a),
	);

    $effect(() => {
        if (!selectedYear && years.length > 0) {
            selectedYear = years[0] as number;
        }
    });

	let filteredEvents = $derived(events.filter((e: any) => e.year === selectedYear));

	let eventRefs = new Map<string, HTMLElement>();
	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			},
		};
	}

	const scrollOffset = 20;

	function scrollToElement(el: HTMLElement) {
		const container = document.getElementById("main-content-scroll-container");

		// fallback to window scrolling if container not found (SPA mode)
		if (container && window.innerWidth >= 1024) {
			const containerRect = container.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const relativeTop = elRect.top - containerRect.top;
			const targetScroll = container.scrollTop + relativeTop - scrollOffset;

			container.scrollTo({ top: targetScroll, behavior: "smooth" });
		} else {
			// Basic window scroll
			const y = el.getBoundingClientRect().top + window.scrollY - scrollOffset - 100; // 100 buffer for sticky header
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	}

	async function selectYear(year: number) {
		expandedEventId = null;
		selectedYear = year;
		// No scrolling needed as list updates in place
	}

	let expandedEventId = $state<string | null>(null);
	let isEntryHovered = $state<boolean[]>([]);

	onMount(() => {
		isEntryHovered = Array(events.length).fill(false);
	});

	function toggleEvent(id: string) {
		if (expandedEventId === id) {
			expandedEventId = null;
		} else {
			expandedEventId = id;
            // Removed setTimeout and scrollToElement call
		}
	}

	function closeEvent(e: Event) {
		e.stopPropagation();
		expandedEventId = null;
	}

	let bottomPadding = $state(128);

	let imageButtonClasses = $derived((isExpanded: boolean, isEntryHovered: boolean) => {
		let baseClasses = "cursor-pointer focus:outline-none duration-100 relative";
		return `${baseClasses}`;
	});

	onMount(() => {
		// no-op for now in SPA
	});
</script>

{#snippet previewRow(event: any, index: number, isExpanded: boolean, rowHovered: boolean)}
	<!-- preview row -->
	<div class="flex w-full justify-start">
		<button
			class="relative flex w-full flex-col overflow-hidden text-left focus:outline-none cursor-pointer duration-100 p-4 {expandedEventId === event.id ? 'bg-[var(--text-color)] text-[var(--bg-color)]' : 'hover:bg-[var(--text-color)] hover:text-[var(--bg-color)]'}"
			onclick={() => toggleEvent(event.id)}
			onmouseenter={() => (isEntryHovered[index] = true)}
			onmouseleave={() => (isEntryHovered[index] = false)}>
			
			<!-- Content Overlay (now just regular content) -->
			<div class="flex w-full flex-col gap-1">
				<div class="shrink-0 opacity-70">
					<span class="text-base md:text-xl">
						{event.displayDate}
					</span>

					{#if event.displayTime}
						<span class="ml-1 text-base md:text-xl">
							{event.displayTime}
						</span>
					{/if}
				</div>

				<h2 class="text-lg font-medium md:text-2xl">
					{event.title}
				</h2>
			</div>

			<!-- Diagonal Pixel Row as Bottom Border -->
			<div 
                class="absolute bottom-0 left-0 right-0 h-[12px] overflow-hidden"
                style="mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);">
				{#if event.thumbnailUrl}
					<DiagonalStrip src={event.thumbnailUrl} alt="" class="h-full w-full object-fill" />
				{/if}
			</div>
		</button>
	</div>
{/snippet}

{#snippet expandedEventContent(event: any)}
	{@const getFilteredFullText = (text: string) => {
		if (!text) return "";
		// Basic HTML parsing in browser environment
		if (typeof document === "undefined") return text;

		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = text;

		const firstImage = tempDiv.querySelector("img");
		const firstFigure = tempDiv.querySelector("figure");

		if (firstImage) {
			if (firstFigure && firstFigure.contains(firstImage)) {
				firstFigure.remove();
			} else {
				firstImage.remove();
			}
		} else if (firstFigure) {
			firstFigure.remove();
		}

		return tempDiv.innerHTML;
	}}
	<div class="expanded-event-container flex w-full flex-col items-center gap-6 p-4">
		<!-- Image Container (w-64 left aligned) -->
		<div class="w-64 self-start">
			{#if event.thumbnailUrl}
				<img src={event.thumbnailUrl} alt={event.title} class="h-auto w-full object-contain" />
			{:else if event.videoUrl}
				<video src={event.videoUrl} class="h-auto w-full object-contain" autoplay muted loop playsinline>
				</video>
			{:else}
				<div class="aspect-video w-full bg-gray-200"></div>
			{/if}
		</div>

		<!-- Event Text -->
		<div class="kirby-content w-full border-t-2 border-solid border-[var(--text-color)] text-base leading-relaxed md:text-lg">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html getFilteredFullText(event.fullText)}
		</div>
	</div>
{/snippet}

<div class="flex w-full flex-col bg-[var(--bg-color)]">
	<!-- Year Select Row -->
	<div class="w-full border-b-2 border-[var(--text-color)] p-4">
		<YearSelect {years} year={selectedYear} {selectYear} />
	</div>

	{#each filteredEvents as event, index}
		<div class="event-row w-full border-b-2 border-[var(--text-color)] transition-colors last:border-b-0" use:addRef={event.id}>
			{@render previewRow(event, index, expandedEventId === event.id, isEntryHovered[index])}
			{#if expandedEventId === event.id}
				{@render expandedEventContent(event)}
			{/if}
		</div>
	{/each}
</div>
