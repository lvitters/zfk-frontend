import { kql } from "$lib/server/kirby";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

interface FirstPage {
	slug: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	// fetch the first listed page to redirect to
	const result = await kql<FirstPage>(
		{
			query: "page('info').children.listed.first",
			select: {
				slug: true,
			},
		},
		fetch,
	);

	if (result?.slug) {
		throw redirect(307, `/info/${result.slug}`);
	}

	// fallback if no pages exist
	return {};
};
