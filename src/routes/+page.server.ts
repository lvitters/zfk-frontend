import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { kql } from "$lib/kirby";
import type { KirbyImage, KirbyPage, ProgrammEvent, Section, Track } from "$lib/types";
import type { PageServerLoad } from "./$types";

// replace raw URLs with their title attribute in HTML
const replaceUrlWithTitle = (html: string | undefined): string | undefined => {
	if (!html) return html;
	return html.replace(/<a\s+(?:[^>]*?\s+)?title="([^"]*)"(?:[^>]*?)>(.*?)<\/a>/gi, (match, title, text) => {
		if (title && (text.trim().startsWith("http") || text.trim().startsWith("www"))) {
			const openTagMatch = match.match(/<a\s+[^>]*>/i);
			if (openTagMatch) {
				return `${openTagMatch[0]}${title}</a>`;
			}
		}
		return match;
	});
};

// ransform Kirby urls to relative production paths
const fixKirbyUrl = (url: string | undefined): string => {
	if (url && url.includes("/media/")) {
		const mediaPath = url.substring(url.indexOf("/media/"));
		// assume backend is deployed to /hintern subfolder
		return `/hintern${mediaPath}`;
	}
	return url || "";
};

// main server-side load function to fetch data from Kirby
export const load: PageServerLoad = async ({ fetch }) => {
	// combine all queries into one single object for KQL
	const megaQuery = {
		query: "site",
		select: {
			// 1. events
			events: {
				query: "page('events').children.listed.sortBy('date', 'desc')",
				select: {
					title: true,
					date: true,
					time: true,
					endDate: true,
					text: "page.text.toBlocks.toHtml",
					formattedDate: "page.date.toDate('d.m.Y')",
					formattedEndDate: "page.endDate.toDate('d.m.Y')",
					url: true,
					id: "page.id",
					images: {
						query: "page.images",
						select: { url: true, uuid: true },
					},
					imageBlocks: {
						query: "page.text.toBlocks.filterBy('type', 'image')",
						select: { content: true },
					},
					videos: {
						query: "page.videos.limit(1)",
						select: { url: true, mime: true },
					},
				},
			},
			// 2. recordings
			audio: {
				query: "page('recordings')",
				select: {
					soundcloudLinks: {
						query: "page.soundcloud_links.toStructure",
						select: {
							title: "structureItem.title.value",
							sortDate: "structureItem.date.toDate('Y-m-d')",
							displayDate: "structureItem.date.toDate('d.m.Y')",
							year: "structureItem.date.toDate('Y')",
							url: "structureItem.url.value",
						},
					},
				},
			},
			// 3. all other sections
			pages: {
				query: "site.children.listed",
				select: {
					id: true,
					title: true,
					slug: true,
					text: "page.text.toBlocks.toHtml",
					images: {
						query: "page.images",
						select: { url: true, uuid: true },
					},
					children: {
						query: "page.children.listed",
						select: {
							id: true,
							title: true,
							slug: true,
							text: "page.text.toBlocks.toHtml",
							images: {
								query: "page.images",
								select: { url: true, uuid: true },
							},
						},
					},
				},
			},
		},
	};

	// fetch all data in a single request
	const result = (await kql(megaQuery, fetch)) as {
		events: ProgrammEvent[];
		audio: {
			soundcloudLinks: { title: string; sortDate: string; displayDate: string; year: string; url: string }[];
		};
		pages: KirbyPage[];
	};

	if (!result) {
		return {
			events: [],
			audioFiles: [],
			sections: [],
		};
	}

	// process events data
	const events = (result.events || []).map((event: ProgrammEvent) => {
		let thumbnailUrl = event.images?.[0]?.url;

		// logic to find the first image block and use it as thumbnail
		if (Array.isArray(event.imageBlocks) && event.imageBlocks.length > 0) {
			const firstImageBlock = event.imageBlocks[0];
			if (
				firstImageBlock &&
				firstImageBlock.content &&
				firstImageBlock.content.image &&
				firstImageBlock.content.image.length > 0
			) {
				const fileId = firstImageBlock.content.image[0];
				const matchingImage = event.images?.find(
					(img: KirbyImage) => fileId.includes(img.uuid) || img.uuid === fileId,
				);
				if (matchingImage) {
					thumbnailUrl = matchingImage.url;
				}
			}
		}

		return {
			...event,
			text: replaceUrlWithTitle(event.text),
			thumbnailUrl: fixKirbyUrl(thumbnailUrl),
			videoUrl: event.videos?.[0]?.url ? new URL(event.videos[0].url, "http://base.com").pathname : undefined,
			videoMime: event.videos?.[0]?.mime,
		};
	});

	// process SoundCloud links
	const audioFiles = (result.audio?.soundcloudLinks || [])
		.map((link) => ({
			id: link.url, // use url as id for external links
			title: link.title,
			year: link.year,
			sortDate: link.sortDate,
			displayDate: link.displayDate,
			externalUrl: link.url,
		}))
		.sort((a, b) => {
			return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime();
		});

	// process all pages into an ordered sections array
	const pages = (result.pages || []) as KirbyPage[];
	const sections: Section[] = pages.map((page: KirbyPage): Section => {
		if (page.slug === "events") {
			return {
				type: "events",
				id: page.id,
				title: page.title,
				slug: page.slug,
			};
		}

		if (page.slug === "recordings") {
			return {
				type: "recordings",
				id: page.id,
				title: page.title,
				slug: page.slug,
			};
		}

		if (page.slug === "bunker") {
			return {
				type: "bunker",
				id: page.id,
				title: page.title,
				slug: page.slug,
				content: {
					text: replaceUrlWithTitle(page.text),
					images: page.images?.map((img: KirbyImage) => ({
						...img,
						url: fixKirbyUrl(img.url),
					})),
				},
			};
		}

		const hasChildren = page.children && page.children.length > 0;
		if (hasChildren) {
			return {
				type: "headerSection",
				id: page.id,
				title: page.title,
				slug: page.slug,
				content: (page.children || []).map((child) => ({
					...child,
					text: replaceUrlWithTitle(child.text),
				})),
			};
		}

		return {
			type: "mainSection",
			id: page.id,
			title: page.title,
			slug: page.slug,
			content: {
				text: replaceUrlWithTitle(page.text),
			},
		};
	});

	return {
		events,
		audioFiles,
		sections,
	};
};
