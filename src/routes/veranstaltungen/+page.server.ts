import { kql } from "$lib/server/kirby";
import type { PageServerLoad } from "./$types";

// Define exactly what fields we expect from Kirby
interface Event {
	title: string;
	date: string;
	time: string;
	endDate: string;
	text: string;
	formattedDate: string;
	formattedEndDate: string;
	url: string;
	id: string;
	thumbnailUrl?: string;
	videoUrl?: string;
	videoMime?: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	// We pass <Event[]> to the kql function to say "We expect an array of Events"
	const events = await kql<Event[]>(
		{
			query: "page('veranstaltungen').children.listed.sortBy('date', 'desc')",
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
					select: { url: true, uuid: true }
				},
				imageBlocks: {
					query: "page.text.toBlocks.filterBy('type', 'image')",
					select: { content: true }
				},
				videos: {
					query: "page.videos.limit(1)",
					select: { url: true, mime: true }
				}
			},
		},
		fetch,
	);

	return {
		// If kql fails (returns null), fallback to an empty array
		events: (events ?? []).map((event: any) => {
			let thumbnailUrl = event.images?.[0]?.url;

			// Try to find the first image used in the content blocks
			// We use the optimized 'imageBlocks' array which only contains image blocks
			if (Array.isArray(event.imageBlocks) && event.imageBlocks.length > 0) {
				const firstImageBlock = event.imageBlocks[0];
				if (firstImageBlock && firstImageBlock.content && firstImageBlock.content.image && firstImageBlock.content.image.length > 0) {
					// Image content is usually an array of file UUIDs strings like "file://..."
					const fileId = firstImageBlock.content.image[0]; 
					// The KQL UUID might not have 'file://', check both
					const matchingImage = event.images?.find((img: any) => 
						fileId.includes(img.uuid) || img.uuid === fileId
					);
					if (matchingImage) {
						thumbnailUrl = matchingImage.url;
					}
				}
			}

			return {
				...event,
				thumbnailUrl,
				videoUrl: event.videos?.[0]?.url,
				videoMime: event.videos?.[0]?.mime
			};
		}),
	};
};
