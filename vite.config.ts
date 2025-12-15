import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	// extract base url from KIRBY_API_URL (default to http://localhost:8000 if not set)
	// assuming KIRBY_API_URL is something like http://localhost:8000/api/query
	const kirbyUrl = env.KIRBY_API_URL ? new URL(env.KIRBY_API_URL).origin : "http://localhost:8000";

	return {
		plugins: [sveltekit(), tailwindcss()],
		server: {
			proxy: {
				// proxy /backend requests to the kirby backend (rewriting the path)
				"/backend": {
					target: kirbyUrl,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/backend/, ""),
				},
				// legacy proxies
				"/media": kirbyUrl,
				"/assets": kirbyUrl,
			},
			fs: {
				allow: ["./db", "../audio"], // allow vite to serve files from the db folder
			},
		},
	};
});