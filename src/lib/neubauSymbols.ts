// symbols that exist in ClashDisplay-Bold.woff2 (codepoints as escapes for readability)
export const NEUBAU_SYMBOLS: string[] = [
	"\u{2602}", // Regenschirm
	"\u{2605}", // Stern
	"\u{261E}", // Handzeige nach Rechts
	"\u{263B}", // Smiley gefüllt
	"\u{267B}", // Recycling-Logo
	"\u{2699}", // Zahnrad
	"\u{26A7}", // All Gender Symbol
	"\u{26D3}", // Kette
	"\u{26EB}", // Schloss
	"\u{26EF}", // Zahnrad 2
	"\u{2716}", // Malkreuz
	"\u{232B}", // Delete Key
	"\u{23FB}", // An-Schalter
	"\u{231B}", // Sanduhr
	"\u{2295}", // Plus in Kreis
	"\u{2191}", // Pfeil nach Oben
	"\u{21BB}", // Pfeil Neu Laden
	"\u{25CC}", // Dot Matrix
	"\u{25A0}", // Checkers Tile
	// "\u{1F310}", // Globus
	// "\u{1F500}", // Pfeil Wiederholen
	// "\u{1F50A}", // Lautsprecher
	// "\u{1F50B}", // Autobatterie
	// "\u{1F512}", // Schloss zum Abschließen
	// "\u{1F517}", // USB Symbol
	// "\u{1F552}", // Uhr Pixel
];

// random symbol, never the same one as `previous`
export function pickNeubauSymbol(previous = ""): string {
	const prev = previous.replace("\uFE0E", "");
	let next = prev;
	while (next === prev) {
		next = NEUBAU_SYMBOLS[Math.floor(Math.random() * NEUBAU_SYMBOLS.length)];
	}
	// U+FE0E forces text presentation so emoji-default codepoints use the font glyph, not the color emoji
	return next + "\uFE0E";
}
