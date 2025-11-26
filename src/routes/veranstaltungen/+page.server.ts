import { kql } from "$lib/server/kirby";
import type { PageServerLoad } from "./$types";

// Define exactly what fields we expect from Kirby
interface Event {
	title: string;
	date: string;
	time: string;
	description: string;
	formattedDate: string;
	url: string;
	id: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	// We pass <Event[]> to the kql function to say "We expect an array of Events"
	const events = await kql<Event[]>({
		query: "page('veranstaltungen').children.listed.sortBy('date', 'desc')",
		select: {
			title: true,
			date: true,
			time: true,
			description: true,
			formattedDate: "page.date.toDate('d.m.Y')",
			url: true,
			id: "page.id"
		},
	}, fetch);

	return {
		// If kql fails (returns null), fallback to an empty array
		events: events ?? [],
	};
};
