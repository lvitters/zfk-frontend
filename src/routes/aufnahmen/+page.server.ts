import { kql } from "$lib/server/kirby.js";
//import type { PageServerLoad } from './$types'; //why don't I need this?

//load from db with year provided, this is called a load function
export const load = async ({ fetch }) => {
	try {
		const response = await kql(
			{
				query: "page('aufnahmen').files.sortBy('datum', 'desc')",
				select: {
					id: "file.uuid",
					filename: "file.filename",
					title: "file.titel.value",
					year: "file.datum.toDate('Y')",
					displayDate: "file.datum.toDate('d.m.Y')",
					sortDate: "file.datum.toDate('Y-m-d')", // Format for consistency with existing Track type
					filePath: "file.url"
				}
			},
			fetch
		);

		const audioFiles = (response || [])
			.filter((file: any) => file.title && file.displayDate)
			.map((file: any) => {
				// Transform Kirby URL to local stream URL to support Range requests (seeking)
			if (file.filePath && file.filePath.includes("/media/")) {
				const relativePath = file.filePath.substring(file.filePath.indexOf("media/"));
				file.filePath = `/api/stream?file=${relativePath}`;
			}

			return file;
		});

		return { audioFiles };
	} catch (error) {
		console.error("Failed to load audio files from Kirby:", error);
		// Return empty array on error to prevent crashes, as existing code expects audioFiles: []
		return { audioFiles: [] };
	}
};

// turn prerendering off because page will be dynamic
export const prerender = false;
