import { dev } from "$app/environment";
import { kql } from "$lib/kirby";
import type { DynamicSection, KirbyImage, KirbyPage, ProgrammEvent, Track } from "$lib/types";
import type { PageLoad } from "./$types";

// helper to replace raw URLs with their title attribute in HTML
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

// helper to transform kirby urls to relative production paths
const fixKirbyUrl = (url: string | undefined) => {
	if (url && url.includes("/media/")) {
		const mediaPath = url.substring(url.indexOf("/media/"));
		// assume backend is deployed to /backend subfolder
		return `/backend${mediaPath}`;
	}
	return url;
};

// helper to extract relative media path for dev proxy
const getRelativeMediaPath = (url: string | undefined) => {
	if (url && url.includes("/media/")) {
		return url.substring(url.indexOf("/media/"));
	}
	return url || "";
};

// main client-side load function to fetch data from kirby
export const load: PageLoad = async ({ fetch }) => {
	// 1. events query
	const eventsQuery = {
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
	};

	// 2. recordings query
	const audioQuery = {
		query: "page('recordings').files.sortBy('datum', 'desc')",
		select: {
			id: "file.uuid",
			filename: "file.filename",
			title: "file.titel.value",
			year: "file.datum.toDate('Y')",
			displayDate: "file.datum.toDate('d.m.Y')",
			sortDate: "file.datum.toDate('Y-m-d')",
			filePath: "file.url",
		},
	};

	// 3. generic pages query (for all other sections)
	const pagesQuery = {
		query: "site.children.listed",
		select: {
			id: true,
			title: true,
			slug: true,
			text: "page.text.toBlocks.toHtml",
			children: {
				query: "page.children.listed",
				select: {
					id: true,
					title: true,
					slug: true,
					text: "page.text.toBlocks.toHtml",
				},
			},
		},
	};

	// 4. events page title query
	const eventsTitleQuery = {
		query: "page('events').title",
	};

	// 5. recordings page title query
	const recordingsTitleQuery = {
		query: "page('recordings').title",
	};

	// fetch all data in parallel
	const [eventsResult, audioResult, pagesResult, eventsTitleResult, recordingsTitleResult] = await Promise.all([
		kql(eventsQuery, fetch),
		kql(audioQuery, fetch),
		kql(pagesQuery, fetch),
		kql(eventsTitleQuery, fetch),
		kql(recordingsTitleQuery, fetch),
	]);

	// process events data
	const events = ((eventsResult || []) as ProgrammEvent[]).map((event: ProgrammEvent) => {
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

	// process audio files data
	const audioFiles = ((audioResult === null ? [] : audioResult) as Track[])
		.filter((file: Track) => file.title && file.displayDate)
		.map((file: Track) => {
			if (dev) {
				// in dev mode, use the stream api to handle range requests (seeking)
				// which the local php server might not support
				const relativePath = getRelativeMediaPath(file.filePath);
				file.filePath = `/api/stream?file=${relativePath}`;
			} else {
				// in production, use the direct backend url (served by apache/nginx with range support)
				file.filePath = fixKirbyUrl(file.filePath) || "";
			}
			return file;
		});

	// process dynamic sections data
	const dynamicSections: DynamicSection[] = ((pagesResult || []) as KirbyPage[])
		.filter((page: KirbyPage) => page.slug !== "events" && page.slug !== "recordings")
		.map((page: KirbyPage) => {
			const hasChildren = page.children && page.children.length > 0;

			const processedPage = {
				...page,
				text: replaceUrlWithTitle(page.text),
				children: page.children?.map((child) => ({
					...child,
					text: replaceUrlWithTitle(child.text),
				})),
			};

			return {
				id: processedPage.id,
				title: processedPage.title,
				slug: processedPage.slug,
				type: hasChildren ? "headerSection" : "mainSection",
				content: hasChildren ? (processedPage.children as KirbyPage[]) : { text: processedPage.text },
			};
		});

	return {
		events,
		audioFiles,
		dynamicSections,
		eventsTitle: eventsTitleResult as string,
		recordingsTitle: recordingsTitleResult as string,
	};
};
