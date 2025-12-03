import { kql } from "$lib/server/kirby";
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from "./$types";

interface InfoPage {
	title: string;
	text: string;
}

export const load: PageServerLoad = async ({ fetch, params }) => {
	// The slug from the URL (e.g., 'ueber-uns', 'selbstverstaendnis')
	// matches the page UID in Kirby
	const data = await kql<InfoPage>(
		{
			query: `page('info/${params.slug}')`,
			select: {
				title: true,
				text: "page.text.kirbytext",
			},
		},
		fetch,
	);

	if (!data) {
		error(404, 'Page not found');
	}

	return {
		page: data,
	};
};
