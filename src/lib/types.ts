export interface KirbyPage {
	id: string;
	title: string;
	slug: string;
	text?: string;
	children?: KirbyPage[]; // Children are also KirbyPages
	images?: KirbyImage[];
}

export type Section =
	| { type: "events"; id: string; title: string; slug: string }
	| { type: "recordings"; id: string; title: string; slug: string }
	| {
			type: "bunker";
			id: string;
			title: string;
			slug: string;
			content: { text?: string; images?: KirbyImage[] };
	  }
	| { type: "headerSection"; id: string; title: string; slug: string; content: KirbyPage[] }
	| { type: "mainSection"; id: string; title: string; slug: string; content: { text?: string } };

export interface DynamicSection {
	id: string;
	title: string;
	slug: string;
	type: "headerSection" | "mainSection";
	content: KirbyPage[] | { text?: string }; // content for headerSection is children (KirbyPage[]), for mainSection is { text: string }
}

export interface Track {
	id: string;
	year: string;
	sortDate: string;
	displayDate: string;
	title: string;
	filePath: string;
	externalUrl?: string;
	isExternal?: boolean;
}

export interface KirbyVideo {
	url: string;
	mime: string;
}

export interface KirbyImage {
	url: string;
	uuid: string;
}

export interface ImageBlockContent {
	image: string[];
}

export interface ImageBlock {
	content: ImageBlockContent;
}

export interface ProgrammEvent {
	id: string;
	date: string; // The original date string from Kirby
	formattedDate: string;
	formattedEndDate?: string;
	time?: string;
	text?: string;
	title: string;
	thumbnailUrl?: string;
	videoUrl?: string;
	// Derived properties
	fullText?: string;
	year: number;
	displayDate: string;
	displayTime: string;
	// New properties from KQL query
	images?: KirbyImage[];
	imageBlocks?: ImageBlock[]; // Now typed!
	videos?: KirbyVideo[];
}
