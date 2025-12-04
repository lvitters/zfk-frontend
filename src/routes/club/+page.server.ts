import { kql } from "$lib/server/kirby";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

interface ClubPage {
	title: string;
	text: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	const data = await kql<ClubPage>(
		{
			query: "page('club')",
			select: {
				title: true,
				text: "page.text.toBlocks.toHtml",
			},
		},
		fetch,
	);

	if (!data) {
		error(404, "Club page not found");
	}

	return {
		page: data,
	};
};
