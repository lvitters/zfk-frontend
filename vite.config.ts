import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		proxy: {
			"/media": "http://localhost:8000",
			"/assets": "http://localhost:8000",
		},
		fs: {
			allow: ["./db", "../audio"], // Allow Vite to serve files from the db folder
		},
	},
});
