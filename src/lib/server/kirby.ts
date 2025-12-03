import { KIRBY_API_PASSWORD, KIRBY_API_URL, KIRBY_API_USER } from "$env/static/private";

interface KqlResponse<T> {
	code: number;
	status: string;
	result: T;
}

export async function kql<T>(queryBody: Record<string, any>, fetcher: typeof fetch): Promise<T | null> {
	const auth = Buffer.from(`${KIRBY_API_USER}:${KIRBY_API_PASSWORD}`).toString("base64");
	const url = KIRBY_API_URL;

	try {
		const response = await fetcher(url, {
			method: "POST",
			headers: {
				Authorization: `Basic ${auth}`,
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

		if (data.status !== "ok") {
			console.error("KQL API Error:", data);
			return null;
		}

		return data.result;
	} catch (e) {
		console.error("KQL Connection Failed:", e);
		return null;
	}
}
