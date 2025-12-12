import { json } from "@sveltejs/kit";
import { kql } from "$lib/server/kirby.js";
import type { Track } from "$lib/types";export async function GET({ fetch }) {
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
					sortDate: "file.datum.toDate('Y-m-d')",
					filePath: "file.url",
				},
			},
			fetch,
		);

		const audioFiles = ((response === null ? [] : response) as Track[])
			.filter((file: Track) => file.title && file.displayDate)
			.map((file: Track) => {
				// Transform Kirby URL to local stream URL to support Range requests (seeking)
				if (file.filePath && file.filePath.includes("/media/")) {
					const relativePath = file.filePath.substring(file.filePath.indexOf("media/"));
					file.filePath = `/api/stream?file=${relativePath}`;
				}

				return file;
			});

		return json(audioFiles);
	} catch (error) {
		console.error("API error fetching audio files from Kirby:", error);
		return json({ error: "Failed to fetch audio files" }, { status: 500 });
	}
}
