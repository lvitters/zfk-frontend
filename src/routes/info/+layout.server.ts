import { kql } from "$lib/server/kirby";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ fetch }) => {
	const result = await kql(
		{
			query: "page('info').children.listed",
			select: {
				id: true,
				title: true,
				slug: true,
			},
		},
		fetch,
	);

	return {
		infoPages: result || [],
	};
};
