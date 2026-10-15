// symbols that exist in ClashDisplay-Bold.woff2 (codepoints as escapes for readability)
export const NEUBAU_SYMBOLS: string[] = [
	"\u{231B}", // ⌛
	"\u{232B}", // ⌫
	"\u{00D7}", // ×
	"\u{23FB}", // ⏻
	"\u{2602}", // ☂
	"\u{2605}", // ★
	"\u{261E}", // ☞
	"\u{263B}", // ☻
	"\u{267B}", // ♻
	"\u{2699}", // ⚙
	"\u{26A7}", // ⚧
	"\u{26D3}", // ⛓
	"\u{26EB}", // ⛫
	"\u{26EF}", // ⛯
	"\u{2716}", // ✖
	"\u{0023}", // #
	"\u{002A}", // *
	"\u{003A}", // :
	"\u{2295}", // ⊕
	"\u{21BB}", // ↻
	"\u{2191}", // ↑
	"\u{25A0}", // ■
	"\u{25CC}", // ◌
];

// random symbol, never the same one as `previous`
export function pickNeubauSymbol(previous = ""): string {
	let next = previous;
	while (next === previous) {
		next = NEUBAU_SYMBOLS[Math.floor(Math.random() * NEUBAU_SYMBOLS.length)];
	}
	return next;
}
