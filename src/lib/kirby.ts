import { env } from "$env/dynamic/private";

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
	// Use the private KIRBY_API_URL from the environment
	const url = env.KIRBY_API_URL || "/hintern/api/query";

	// Verify if credentials exist (for debugging)
	if (!env.KIRBY_API_USER || !env.KIRBY_API_PASSWORD) {
		console.warn(`KQL: Missing credentials for user ${env.KIRBY_API_USER}. URL: ${url}`);
	}

	// Create Basic Auth header (Node-friendly encoding)
	const auth = Buffer.from(`${env.KIRBY_API_USER}:${env.KIRBY_API_PASSWORD}`).toString("base64");

	try {
		const response = await fetcher(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${auth}`,
			},
			body: JSON.stringify(queryBody),
		});

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			const text = await response.text();
			console.error(`KQL Connection Failed: Expected JSON from ${url} but got ${contentType}`);
			console.error(`Status: ${response.status} ${response.statusText}`);
			console.error(`Response body preview: ${text.slice(0, 500)}...`);
			return null;
		}

		const data: KqlResponse<T> = await response.json();

		if (data.code !== 200) {
			console.error(`KQL API Error: ${data.code} ${data.status}`, data);
			return null;
		}

		return data.result;
	} catch (e) {
		console.error("KQL Connection Failed with exception:", e);
		return null;
	}
}
