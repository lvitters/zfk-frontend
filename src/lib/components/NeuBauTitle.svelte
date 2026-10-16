<script lang="ts">
	import { onMount } from "svelte";
	import { pickNeubauSymbol } from "$lib/neubauSymbols";

	// optional [min, max] range in ms; the symbol is swapped after a random delay in that range.
	// omitted = pick once on mount and keep it
	// `symbol` pins a specific symbol (no random pick, no cycling)
	let { cycleRangeMs, symbol: fixedSymbol }: { cycleRangeMs?: [number, number]; symbol?: string } =
		$props();

	// empty on the server and first render (no flash of a wrong symbol), set once mounted
	let randomSymbol = $state("");

	let shown = $derived(fixedSymbol ?? randomSymbol);

	onMount(() => {
		if (fixedSymbol !== undefined) return;

		randomSymbol = pickNeubauSymbol();

		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (!cycleRangeMs || reducedMotion) return;

		const [min, max] = cycleRangeMs;
		let timeout: ReturnType<typeof setTimeout>;

		// schedule the next swap after a fresh random delay within [min, max]
		const schedule = () => {
			timeout = setTimeout(
				() => {
					randomSymbol = pickNeubauSymbol(randomSymbol);
					schedule();
				},
				min + Math.random() * (max - min),
			);
		};
		schedule();

		return () => clearTimeout(timeout);
	});
</script>

<span>NEU{shown}BAU</span>
