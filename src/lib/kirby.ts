import { dev } from "$app/environment";

interface KqlResponse<T> {
	code: number;
	status: string;
	result: T;
}

interface KqlQueryBody {
	query: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	select?: Record<string, any> | boolean;
}

export async function kql<T>(queryBody: KqlQueryBody, fetcher: typeof fetch): Promise<T | null> {
	// in dev mode (npm run dev), we use the proxy /backend/api/query which goes to localhost:8000/api/query
	// in prod mode (static build), we assume the backend is at /backend/api/query relative to the site root
	const url = "/backend/api/query";

	try {
		const response = await fetcher(url, {
			method: "POST",
			headers: {
				// no auth header needed as we enabled public kql in config.php
				"Content-Type": "application/json",
			},
			body: JSON.stringify(queryBody),
		});

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			const text = await response.text();
			console.error(`KQL Connection Failed: Expected JSON from ${url} but got ${contentType}`);
			console.error(`Response body preview: ${text.slice(0, 200)}...`);
			return null;
		}

		const data: KqlResponse<T> = await response.json();

		// kirby kql might return status "error" or just the result?
		// usually standard kql wrapper returns { code, status, result }
		if (data.code !== 200) {
			console.error("KQL API Error:", data);
			return null;
		}

		return data.result;
	} catch (e) {
		console.error("KQL Connection Failed:", e);
		return null;
	}
}
