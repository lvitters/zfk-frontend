<script lang="ts">
	import YearSelect from "$lib/components/YearSelect.svelte";
	import { toPng } from "html-to-image";
	import { dev } from "$app/environment";
	import { onMount } from "svelte";

	const programData: Record<string, { date: string; time: string; title: string; subtitle: string }[]> = {
		juni: [
			{
				date: "05.05.",
				time: "17 - 00 Uhr",
				title: "Defibrillator & Drittel @SummerSounds",
				subtitle: "Takeover",
			},
			{
				date: "06.06.",
				time: "23:30 - 05:XX Uhr",
				title: "SummerSounds Afterparty",
				subtitle: "im NEU ♻ BAU",
			},
			{
				date: "tba",
				time: "",
				title: "DIESDAS GESCHICHTEN ERZÄHLEN",
				subtitle: "Abschlusspräsentation Kelvin Scharnhorst",
			},
		],
	};

	const activeMonth = "juni";

	const events = programData[activeMonth] || [];
	const currentYear = new Date().getFullYear();
	const years = [currentYear, currentYear - 1];

	let localDarkMode = $state(false);
	let localHue = $state(210);
	let aspectRatio = $state("4:5");
	let innerHeight = $state(0);

	let colors = $derived.by(() => {
		const bgL = localDarkMode ? "10%" : "90%";
		const textL = localDarkMode ? "90%" : "10%";
		const hue = localHue;
		const complementaryHue = (hue + 180) % 360;

		return {
			bg: `hsl(${hue}, 100%, ${bgL})`,
			text: `hsl(${complementaryHue}, 100%, ${textL})`,
			highlight: `hsl(${complementaryHue}, 100%, 50%)`,
		};
	});

	let scale = $derived.by(() => {
		if (innerHeight === 0) return 0.5;
		const targetHeight = aspectRatio === "4:5" ? 1350 : 1440;
		// leave some padding (80px top/bottom)
		return Math.min(0.8, (innerHeight - 160) / targetHeight);
	});

	// svelte-ignore non_reactive_update
	let sharepicEl: HTMLElement;
	// svelte-ignore non_reactive_update
	let wrapperEl: HTMLElement;

	$effect(() => {
		if (wrapperEl) {
			wrapperEl.style.setProperty("--bg-color", colors.bg);
			wrapperEl.style.setProperty("--text-color", colors.text);
			wrapperEl.style.setProperty("--highlight-color", colors.highlight);
		}
	});

	onMount(() => {
		localDarkMode = Math.random() > 0.5;
		localHue = Math.floor(Math.random() * 360);
	});

	async function saveAsPng() {
		if (!sharepicEl) return;

		const width = 1080;
		const height = aspectRatio === "4:5" ? 1350 : 1440;

		try {
			const dataUrl = await toPng(sharepicEl, {
				width: width,
				height: height,
				style: {
					transform: "scale(1)",
					transformOrigin: "top left",
				},
				pixelRatio: 1,
			});

			const link = document.createElement("a");
			link.download = `zfk-sharepic-${activeMonth}-${aspectRatio.replace(":", "-")}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error("Failed to save PNG", err);
		}
	}
</script>

<svelte:window bind:innerHeight />

<svelte:head>
	<title>sharepic: {activeMonth}</title>
</svelte:head>

{#if dev}
	<div bind:this={wrapperEl}>
		<div class="no-print fixed top-8 left-8 z-50 flex flex-col gap-4">
			<button
				class="cursor-pointer bg-(--text-color) px-6 py-3 font-bold text-(--bg-color) shadow-xl hover:bg-(--highlight-color)"
				onclick={saveAsPng}>
				SAVE AS PNG
			</button>
			<button
				class="cursor-pointer bg-(--text-color) px-6 py-3 font-bold text-(--bg-color) shadow-xl hover:bg-(--highlight-color)"
				onclick={() => (aspectRatio = aspectRatio === "4:5" ? "3:4" : "4:5")}>
				TOGGLE ASPECT ({aspectRatio})
			</button>
		</div>

		<div class="sharepic-wrapper">
			<div
				id="sharepic"
				bind:this={sharepicEl}
				style="
				width: 1080px; 
				height: {aspectRatio === '4:5' ? '1350px' : '1440px'}; 
				--sharepic-height: {aspectRatio === '4:5' ? '1350px' : '1440px'};
				transform: scale({scale});
			"
				class="relative flex origin-top flex-col overflow-hidden bg-(--bg-color) p-14 text-(--text-color)">
				<div
					class="relative flex w-full shrink-0 items-center overflow-hidden border-b-2 border-(--text-color) bg-(--bg-color) py-10">
					<button
						class="group no-print absolute top-0 right-0 z-50 cursor-pointer p-2 focus:outline-none"
						onclick={() => (localDarkMode = !localDarkMode)}
						aria-label="Toggle theme">
						<div
							class="h-10 w-10 bg-(--text-color) group-hover:bg-(--highlight-color)"
							style="
							mask-image: url('data:image/svg+xml;utf8,{localDarkMode
								? `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z%22/></svg>`
								: `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 2v2%22/><path d=%22M12 20v2%22/><path d=%22m4.93 4.93 1.41 1.41%22/><path d=%22m17.66 17.66 1.41 1.41%22/><path d=%22M2 12h2%22/><path d=%22M20 12h2%22/><path d=%22m6.34 17.66-1.41 1.41%22/><path d=%22m19.07 4.93-1.41 1.41%22/><circle cx=%2212%22 cy=%2212%22 r=%224%22/></svg>`}');
							-webkit-mask-image: url('data:image/svg+xml;utf8,{localDarkMode
								? `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z%22/></svg>`
								: `<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M12 2v2%22/><path d=%22M12 20v2%22/><path d=%22m4.93 4.93 1.41 1.41%22/><path d=%22m17.66 17.66 1.41 1.41%22/><path d=%22M2 12h2%22/><path d=%22M20 12h2%22/><path d=%22m6.34 17.66-1.41 1.41%22/><path d=%22m19.07 4.93-1.41 1.41%22/><circle cx=%2212%22 cy=%2212%22 r=%224%22/></svg>`}');
							mask-size: contain;
							-webkit-mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-repeat: no-repeat;
							mask-position: center;
							-webkit-mask-position: center;
						">
						</div>
					</button>

					<div class="flex h-50 w-50 shrink-0 items-center justify-center rounded-full">
						<div
							class="animate-spin-vinyl h-full w-full bg-(--highlight-color)"
							style="
							mask-image: url('/logo_zfk_transparent.png');
							-webkit-mask-image: url('/logo_zfk_transparent.png');
							mask-size: contain;
							-webkit-mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-repeat: no-repeat;
							mask-position: center;
							-webkit-mask-position: center;
							will-change: transform;
						">
						</div>
					</div>

					<div class="ml-8 flex flex-1 items-center">
						<div
							class="ml-7 h-24 w-[540px] bg-(--text-color)"
							style="
							mask-image: url('/neubau.svg');
							-webkit-mask-image: url('/neubau.svg');
							mask-size: contain;
							-webkit-mask-size: contain;
							mask-repeat: no-repeat;
							-webkit-mask-repeat: no-repeat;
							mask-position: center left;
						">
						</div>
					</div>
				</div>

				<div
					class="relative w-full shrink-0 border-b-2 border-(--text-color) bg-(--text-color) text-(--bg-color)">
					<div class="font-clash-display px-4 py-4 text-[120px] leading-none font-bold uppercase">
						{activeMonth}
					</div>
				</div>

				<YearSelect {years} year={currentYear} selectYear={() => {}} />

				<main class="font-clash-grotesk flex grow flex-col overflow-hidden">
					{#each events as event}
						<div class="flex w-full flex-col border-b-2 border-(--text-color) last:border-b-0">
							<div class="flex w-full flex-col gap-1 py-6 text-left">
								<div class="flex w-full items-center justify-between">
									<span class="text-4xl font-medium whitespace-pre tabular-nums">
										{event.date}
									</span>
									<span class="text-4xl leading-tight font-medium whitespace-pre">
										{event.title}
									</span>
								</div>
								<div class="flex items-baseline justify-between gap-6">
									<div class="flex flex-col gap-1">
										<span class="text-4xl font-medium whitespace-pre tabular-nums">
											{event.time}
										</span>
									</div>
									{#if event.subtitle}
										<span class="text-3xl whitespace-pre tabular-nums opacity-85">
											{event.subtitle}
										</span>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</main>

				<footer class="mt-auto flex items-end justify-between border-t-2 border-(--text-color) py-2">
					<div class="text-3xl font-medium text-(--text-color)">53°04'18.3"N 8°48'04.4"E</div>
					<!-- <div class="text-3xl font-medium text-(--text-color)">zfk-hb.de</div> -->
					<div class="text-3xl font-medium text-(--text-color)">Osterstraße 19X, 28199 Bremen</div>
				</footer>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		background-color: white !important;
		overflow: hidden;
		transition: none !important;
	}

	.sharepic-wrapper {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		height: 100vh;
		width: 100vw;
		padding: 80px 0;
		transition: none !important;
	}

	#sharepic {
		box-shadow: 0 0 100px rgba(0, 0, 0, 0.5);
		flex-shrink: 0;
		transition: none !important;
	}

	#sharepic * {
		transition: none !important;
	}

	.no-print {
		@media print {
			display: none !important;
		}
	}

	@media print {
		:global(body) {
			margin: 0 !important;
			padding: 0 !important;
			overflow: hidden !important;
		}

		.sharepic-wrapper {
			padding: 0 !important;
			margin: 0 !important;
			display: block !important;
			height: var(--sharepic-height) !important;
			width: 1080px !important;
		}

		#sharepic {
			position: absolute !important;
			top: 0 !important;
			left: 0 !important;
			border: none !important;
			box-shadow: none !important;
			width: 1080px !important;
			height: var(--sharepic-height) !important;
			print-color-adjust: exact;
			-webkit-print-color-adjust: exact;
			transform: scale(1) !important;
			transform-origin: top left !important;
		}

		@page {
			size: 1080px var(--sharepic-height);
			margin: 0;
		}
	}
</style>
