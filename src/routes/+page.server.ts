import { kql } from "$lib/server/kirby";
import type { DynamicSection, KirbyImage, KirbyPage, ProgrammEvent, Track } from "$lib/types";
import type { PageServerLoad } from "./$types";

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

export const load: PageServerLoad = async ({ fetch }) => {
	// 1. Veranstaltungen Query
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

	// 2. Aufnahmen Query
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

	// 3. Generic Pages Query (for all other sections)
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

	// 4. Events Page Title Query
	const eventsTitleQuery = {
		query: "page('events').title",
	};

	// 5. Recordings Page Title Query
	const recordingsTitleQuery = {
		query: "page('recordings').title",
	};

	const [eventsResult, audioResult, pagesResult, eventsTitleResult, recordingsTitleResult] = await Promise.all([
		kql(eventsQuery, fetch),
		kql(audioQuery, fetch),
		kql(pagesQuery, fetch),
		kql(eventsTitleQuery, fetch),
		kql(recordingsTitleQuery, fetch),
	]);
	console.log("Audio Result:", audioResult);

	// Process Events
	const events = ((eventsResult || []) as ProgrammEvent[]).map((event: ProgrammEvent) => {
		let thumbnailUrl = event.images?.[0]?.url;

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
			thumbnailUrl: thumbnailUrl ? new URL(thumbnailUrl).pathname : undefined,
			videoUrl: event.videos?.[0]?.url ? new URL(event.videos[0].url).pathname : undefined,
			videoMime: event.videos?.[0]?.mime,
		};
	});

	// Process Audio
	const audioFiles = ((audioResult === null ? [] : audioResult) as Track[])
		.filter((file: Track) => file.title && file.displayDate)
		.map((file: Track) => {
			if (file.filePath && file.filePath.includes("/media/")) {
				const relativePath = file.filePath.substring(file.filePath.indexOf("media/"));
				file.filePath = `/api/stream?file=${relativePath}`;
			}
			return file;
		});

	// Process Dynamic Sections
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
