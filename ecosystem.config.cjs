require("dotenv").config();

if (!process.env.PM2_NAME) {
	console.error("⚠️  Missing NAME in .env");
	process.exit();
}

if (!process.env.PM2_PORT) {
	console.error("⚠️  Missing PORT in .env");
	process.exit();
}

if (!process.env.ORIGIN) console.error("⚠️  Missing ORIGIN in .env");
if (!process.env.HOST) console.error("⚠️  Missing HOST in .env");
if (!process.env.PORT) console.error("⚠️  Missing PORT in .env");

module.exports = {
	apps: [
		{
			name: process.env.PM2_NAME,
			port: process.env.PM2_PORT,
			script: "./build/index.js",
			watch: true,
			env: {
				NODE_ENV: "production", // Set Node environment to production
				ORIGIN: process.env.ORIGIN, // Pass the correct HTTPS origin
				HOST: process.env.HOST, // Pass host for SvelteKit adapter
				PORT: process.env.PORT, // Pass port for SvelteKit adapter
				BODY_SIZE_LIMIT: process.env.BODY_SIZE_LIMIT, // Pass body size limit
				// Add any other env vars your app needs from .env
			},
		},
	],
};
