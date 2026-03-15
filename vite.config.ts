import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const apiUrl = env.KIRBY_API_URL || "http://localhost:8000/api/query";
	const kirbyUrl = new URL(apiUrl).origin;
	const isSubfolder = apiUrl.includes("/hintern/");

	const proxyConfig = {
		// proxy /hintern requests to the kirby backend (rewriting the path if not in subfolder)
		"/hintern": {
			target: kirbyUrl,
			changeOrigin: true,
			rewrite: (path: string) => isSubfolder ? path : path.replace(/^\/hintern/, ""),
		},
		// legacy proxies
		"/media": kirbyUrl,
		"/assets": kirbyUrl,
	};

	return {
		plugins: [sveltekit(), tailwindcss()],
		server: {
			proxy: proxyConfig,
		},
		preview: {
			proxy: proxyConfig,
		},
	};
});
