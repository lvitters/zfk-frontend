import { env } from "$env/dynamic/private";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = () => {
	return {
		isMaintenance: env.MAINTENANCE === "true"
	};
};
