import { json } from "@sveltejs/kit";
import { getAllEntries } from "../../../../db/entries.js";

export async function GET() {
	try {
		const audioFiles = await getAllEntries();
		return json(audioFiles);
	} catch (error) {
		console.error("API error fetching audio files:", error);
		return json({ error: "Failed to fetch audio files" }, { status: 500 });
	}
}
