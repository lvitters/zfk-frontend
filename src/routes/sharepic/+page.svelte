<script lang="ts">
	import YearSelect from "$lib/components/YearSelect.svelte";
	import { toPng } from "html-to-image";
	import { dev } from "$app/environment";
	import { onMount } from "svelte";

	const programData: Record<string, { date: string; time: string; title: string }[]> = {
		april: [
			{ date: "13.03.", time: "20:00", title: "HDMI record release" },
			{ date: "20.03.", time: "16:00", title: "Bunker An'n Diek Opening" },
			{ date: "27.03.", time: "23:00", title: "Platzhalter" },
		],
		mai: [
			{ date: "03 - 04.05", time: "20:00", title: "Phantasia" },
			{ date: "11.05.", time: "23:00", title: "Platzhalter" },
			{ date: "17.05.", time: "23:00", title: "Platzhalter" },
		],
	};

	const activeMonth = "april";

	const events = programData[activeMonth] || [];
	const currentYear = new Date().getFullYear();
	const years = [currentYear, currentYear - 1];

	let localDarkMode = $state(false);

	// svelte-ignore non_reactive_update
	let sharepicEl: HTMLElement;
	// svelte-ignore non_reactive_update
	let wrapperEl: HTMLElement;

	onMount(() => {
		localDarkMode = Math.random() > 0.5;

		const currentHue = Math.floor(Math.random() * 360).toString();
		
		if (wrapperEl) {
			wrapperEl.style.setProperty("--bg-hue", currentHue);
		}
	});

	$effect(() => {
		document.documentElement.style.setProperty("--bg-lightness", localDarkMode ? "10%" : "90%");
		document.documentElement.style.setProperty("--text-lightness", localDarkMode ? "90%" : "10%");
	});

	async function saveAsPng() {
		if (!sharepicEl) return;
		
		try {
			const dataUrl = await toPng(sharepicEl, {
				width: 1080,
				height: 1350,
				style: {
					transform: 'scale(1)',
					transformOrigin: 'top left'
				}
			});
			
			const link = document.createElement('a');
			link.download = `zfk-sharepic-${activeMonth}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error('Failed to save PNG', err);
		}
	}
</script>

<svelte:head>
	<title>sharepic: {activeMonth}</title>
</svelte:head>

{#if dev}
	<div class="fixed top-8 left-8 z-50 flex flex-col gap-4 no-print">
		<button
			class="cursor-pointer bg-(--text-color) px-6 py-3 font-bold text-(--bg-color) shadow-xl hover:bg-(--highlight-color)"
			onclick={saveAsPng}>
			SAVE AS PNG
		</button>
	</div>

	<div
		class="sharepic-wrapper"
		bind:this={wrapperEl}>
		<div
			id="sharepic"
			bind:this={sharepicEl}
			class="relative flex h-337.5 w-270 flex-col overflow-hidden bg-(--bg-color) p-8 text-(--text-color)">
			
			<div class="relative flex w-full items-center overflow-hidden border-b-2 border-(--text-color) bg-(--bg-color) py-10">
				<button
					class="group absolute top-0 right-0 z-50 cursor-pointer p-2 focus:outline-none no-print"
					onclick={() => localDarkMode = !localDarkMode}
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
					<div class="text-4xl font-medium leading-tight">
						BUNKER 
						<br>
						AN'N DIEK
					</div>
				</div>
			</div>

			<div class="relative w-full border-b-2 border-(--text-color) bg-(--text-color) text-(--bg-color)">
				<div class="font-clash-display py-4 px-4 text-[120px] leading-none font-bold uppercase">
					APRIL
				</div>
			</div>

			<div class="w-full border-b-2 border-(--text-color) py-4 px-4">
				<YearSelect {years} year={currentYear} selectYear={() => {}} />
			</div>

			<main class="flex grow flex-col">
				{#each events as event}
					<div class="flex w-full flex-col border-b-2 border-(--text-color) last:border-b-0">
						<div class="flex w-full flex-col gap-1 py-8 text-left">
							<div class="flex shrink-0 items-center gap-6 text-4xl leading-none tabular-nums opacity-85">
								<span>{event.date}</span>
								{#if event.time}
									<span>{event.time}</span>
								{/if}
							</div>
							<div class="mt-2 text-5xl font-medium leading-tight">
								{event.title}
							</div>
						</div>
					</div>
				{/each}
			</main>

			<footer class="mt-auto flex items-end justify-end border-t-2 border-(--text-color) py-8">
				<div class="text-3xl font-medium tracking-[0.2em] uppercase text-(--highlight-color)">
					Osterstraße 19X, Eingang Am Deich
				</div>
			</footer>
		</div>
	</div>
{/if}

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
		background-color: var(--bg-color);
		overflow-x: hidden;
	}

	.sharepic-wrapper {
		display: flex;
		justify-content: center;
		align-items: flex-start;
		min-height: 100vh;
		padding: 4rem 0;
		transition: none !important;
	}

	#sharepic {
		box-shadow: 0 0 100px rgba(0, 0, 0, 0.5);
		flex-shrink: 0;
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
			height: 1350px !important;
			width: 1080px !important;
		}

		#sharepic {
			position: absolute !important;
			top: 0 !important;
			left: 0 !important;
			border: none !important;
			box-shadow: none !important;
			width: 1080px !important;
			height: 1350px !important;
			print-color-adjust: exact;
			-webkit-print-color-adjust: exact;
		}

		@page {
			size: 1080px 1350px;
			margin: 0;
		}
	}

	@media (max-width: 1200px) {
		#sharepic {
			transform: scale(0.6);
			transform-origin: top center;
		}
		.sharepic-wrapper {
			height: 900px;
			overflow: hidden;
		}
	}
</style>
