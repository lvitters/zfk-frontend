<script lang="ts">
	import YearSelect from "../yearSelect.svelte";
	import "$lib/css/fonts.css";
	import NavBottomPortal from "$lib/NavBottomPortal.svelte";
	import { getNavHeight } from "$lib/layoutState.svelte";

	let { data } = $props();

	// calculate events once from data.events, handling potential undefined data.events
	const events = (data.events || []).map((e) => {
		let displayDate = e.formattedDate;
		let displayTime = "";
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

	// extract unique years and sort them in descending order
	const years = Array.from(new Set(events.map((event) => event.year))).sort((a, b) => Number(b) - Number(a));

	let selectedYear = $state<number>(years[0]);

	let eventRefs = new Map<string, HTMLElement>();
	function addRef(node: HTMLElement, id: string) {
		eventRefs.set(id, node);
		return {
			destroy() {
				eventRefs.delete(id);
			},
		};
	}

	const scrollOffset = 20; // define a small gap in pixels

	function scrollToElement(el: HTMLElement) {
		const container = document.getElementById("main-content-scroll-container");

		if (container && window.innerWidth >= 1024) {
			// desktop scrolling via container
			const containerRect = container.getBoundingClientRect();
			const elRect = el.getBoundingClientRect();
			const relativeTop = elRect.top - containerRect.top;
			const targetScroll = container.scrollTop + relativeTop - scrollOffset;

			container.scrollTo({ top: targetScroll, behavior: "smooth" });
		} else {
			// mobile scrolling via window
			const navHeight = getNavHeight();
			const y = el.getBoundingClientRect().top + window.scrollY - navHeight - scrollOffset;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	}

	async function selectYear(year: number) {
		expandedEventId = null; // close any expanded event
		selectedYear = year;
		await tick();
		setTimeout(() => {
			const firstEventOfYear = events.find((e) => e.year === year);
			if (firstEventOfYear) {
				const el = eventRefs.get(firstEventOfYear.id);
				if (el) {
					scrollToElement(el);
				}
			}
		}, 50);
	}

	let expandedEventId = $state<string | null>(null);
	let isEntryHovered = $state<boolean[]>([]);

	// onMount to initialize isEntryHovered array
	onMount(() => {
		isEntryHovered = Array(events.length).fill(false);
	});

	function toggleEvent(id: string) {
		if (expandedEventId === id) {
			expandedEventId = null;
		} else {
			expandedEventId = id;
			// wait for the closing animation to finish (approx 200ms) plus a small buffer
			setTimeout(() => {
				if (expandedEventId && eventRefs.has(expandedEventId)) {
					const el = eventRefs.get(expandedEventId);
					if (el) {
						scrollToElement(el);
					}
				}
			}, 250);
		}
	}

	function closeEvent(e: Event) {
		e.stopPropagation();
		expandedEventId = null;
	}
	import { onMount, tick } from "svelte";

	let bottomPadding = $state(128);

	let imageButtonClasses = $derived((isExpanded: boolean, isEntryHovered: boolean) => {
		let baseClasses =
			"w-[50vw] shrink-0 cursor-pointer focus:outline-none md:w-[50vw] lg:w-[25vw] duration-100 relative";
		let borderClasses = "border-2 border-black"; // Base border properties
		let outlineClasses = "outline-dotted"; // Outline style is always dotted

		const isEffectActive = isExpanded || isEntryHovered;

		if (isEffectActive) {
			// Expanded OR Hovered: border transparent, dotted outline visible
			borderClasses += " border-transparent";
			outlineClasses += " outline-4 outline-black outline-offset-2"; // Visible dotted outline
		} else {
			// Default (not expanded, not hovered): solid border, invisible outline
			borderClasses += " border-solid";
			outlineClasses += " outline-0 outline-transparent outline-offset-0"; // Invisible dotted outline
			// Add hover effects for *this button itself*
			borderClasses += " hover:border-transparent"; // Add hover effects for border
			outlineClasses += " hover:outline-black hover:outline-4 hover:outline-offset-2"; // Add hover effects for outline
		}

		return `${baseClasses} ${borderClasses} ${outlineClasses}`;
	});

	onMount(() => {
		const updatePadding = () => {
			if (window.innerWidth >= 1024) {
				bottomPadding = window.innerHeight;
			} else {
				bottomPadding = 128;
			}
		};

		updatePadding();
		window.addEventListener("resize", updatePadding);

		return () => {
			window.removeEventListener("resize", updatePadding);
		};
	});
</script>

<NavBottomPortal>
	<YearSelect {years} year={selectedYear} {selectYear} />
</NavBottomPortal>

<div class="flex w-full flex-col" style="padding-bottom: {bottomPadding}px;">
	{#snippet previewRow(event: any, index: number, isExpanded: boolean, isEntryHovered: boolean)}
		<!-- preview row -->
		<div class="flex w-full {index % 2 !== 0 ? 'justify-end' : 'justify-start'} lg:justify-center">
			<div
				class="flex w-fit max-w-full items-center gap-6 p-4

					{index % 2 !== 0
					? 'translate-x-4 flex-row-reverse lg:mr-[-8rem]'
					: '-translate-x-4 flex-row lg:ml-[-8rem]'} lg:items-end">
				<!-- image side -->
				<button
					class={imageButtonClasses(expandedEventId === event.id, isEntryHovered)}
					onclick={() => toggleEvent(event.id)}
					onmouseenter={() => isEntryHovered[true]}
					onmouseleave={() => isEntryHovered[false]}>
					{#if event.thumbnailUrl}
						<img src={event.thumbnailUrl} alt={event.title} class="h-auto w-full object-contain" />
					{:else if event.videoUrl}
						<video
							src={event.videoUrl}
							class="h-auto w-full object-contain"
							autoplay
							muted
							loop
							playsinline>
						</video>
					{:else}
						<div class="aspect-video w-full bg-gray-200"></div>
					{/if}
				</button>

				<!-- content side -->
				<div
					class="flex flex-1 flex-col justify-center gap-2 transition-colors {index % 2 !== 0
						? 'items-end text-right'
						: 'items-start text-left'}">
					<div class="opacity-70">
						<div class="text-sm">{event.displayDate}</div>

						{#if event.displayTime}
							<div class="text-xs">{event.displayTime}</div>
						{/if}
					</div>

					<div class="flex items-center gap-4">
						{#if isExpanded && index % 2 !== 0}
							<div
								role="button"
								tabindex="0"
								onclick={closeEvent}
								onkeydown={(e) => e.key === "Enter" && closeEvent(e)}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
								aria-label="Close details">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 transition-transform hover:scale-110">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</div>
						{/if}
						<h2 class="hidden text-lg font-medium md:block md:text-2xl">
							<span class="focus:outline-none">
								{event.title}
							</span>
						</h2>

						{#if isExpanded && index % 2 === 0}
							<div
								role="button"
								tabindex="0"
								onclick={closeEvent}
								onkeydown={(e) => e.key === "Enter" && closeEvent(e)}
								class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
								aria-label="Close details">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 transition-transform hover:scale-110">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/snippet}

	{#each events as event, index}
		<div class="event-row mb-4 w-full transition-colors" use:addRef={event.id}>
			{#if expandedEventId === event.id}
				<!-- expanded view -->

				<!-- mobile: replacement view -->
				<div class="flex w-full flex-col gap-3 lg:hidden">
					<div class="flex items-center justify-start gap-4 pb-4">
						<button
							onclick={closeEvent}
							class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full"
							aria-label="Close details">
							<!-- closing X -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-6 w-6 duration-100 hover:scale-110">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<!-- event title -->
						<button class="cursor-pointer text-2xl font-medium md:text-3xl" onclick={closeEvent}>
							{event.title}
						</button>
					</div>

					<!-- event text -->
					<div class="kirby-content w-full text-base leading-relaxed md:text-lg">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html event.fullText}
					</div>
				</div>

				<!-- desktop: inline accordion view -->
				<div class="hidden flex-col gap-6 lg:flex">
					{@render previewRow(event, index, true, isEntryHovered[index])}
					<div class="kirby-content desktop-expanded-content w-full text-lg leading-relaxed">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html event.fullText}
					</div>
				</div>
			{:else}
				{@render previewRow(event, index, false, isEntryHovered[index])}
			{/if}
			{#if expandedEventId === event.id}
				<div class="separator-line h-[2px] w-full border-b-4 border-dotted border-black duration-100"></div>
			{/if}
		</div>
	{/each}
</div>
