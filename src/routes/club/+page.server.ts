import { kql } from "$lib/server/kirby";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

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
				text: "page.text.kirbytext",
			},
		},
		fetch,
	);

    if (!data) {
        error(404, 'Club page not found');
    }

	return {
		page: data,
	};
};
