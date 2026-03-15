import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import fs from "fs";
import path from "path";

export const prerender = false;

export async function GET({ url, request }) {
	const filePath = url.searchParams.get("file");

	if (!filePath) {
		throw error(400, "Missing file parameter");
	}

	console.log("[Stream API] Requesting file:", filePath);

	// use KIRBY_BACKEND_PATH from .env or default to sibling directory
	const backendMediaDir = env.KIRBY_BACKEND_PATH || path.resolve("..", "zfk-backend");
	
	if (!fs.existsSync(backendMediaDir)) {
		console.error(`[Stream API] Local backend directory not found at: ${backendMediaDir}`);
		throw error(500, `Local backend directory not found. Please check KIRBY_BACKEND_PATH in .env`);
	}

	console.log("[Stream API] Backend Dir:", backendMediaDir);

	// construct the full path. 'filePath' is expected to be like '/media/pages/...'
	// we need to strip the leading slash to use path.join correctly or handle absolute paths
	const relativeFilePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
	const requestedPath = path.resolve(backendMediaDir, relativeFilePath);
	console.log("[Stream API] Resolved Path:", requestedPath);

	// security: ensure the resolved path is actually inside backend directory
	if (!requestedPath.startsWith(backendMediaDir)) {
		console.error("Path traversal attempt:", requestedPath);
		throw error(403, "Forbidden");
	}

	if (!fs.existsSync(requestedPath)) {
		console.log("[Stream API] File not found in media, checking content fallback...");
		// Fallback: Check if the file exists in the content source folder
		// The structure in media is .../media/pages/recordings/HASH/filename.mp3
		// The structure in content is .../content/2_recordings/filename.mp3
		// or potentially different depending on the slug.

		// We can try to find the file by name in the content/2_recordings folder?
		// Or try to map the path?
		// The original code hardcoded 'content/2_recordings'. Let's try that.

		const filename = path.basename(requestedPath);
		const contentDir = path.resolve(backendMediaDir, "content/2_recordings");
		const fallbackPath = path.join(contentDir, filename);

		console.log("[Stream API] Checking fallback path:", fallbackPath);

		if (fs.existsSync(fallbackPath)) {
			console.log("[Stream API] Found in content fallback!");
			return serveFile(fallbackPath, request);
		}

		console.error("File not found:", requestedPath);
		throw error(404, "File not found");
	}

	return serveFile(requestedPath, request);
}

function serveFile(filePath: string, request: Request) {
	// get file stats for range request handling
	const stats = fs.statSync(filePath);
	const contentLength = stats.size;
	const range = request.headers.get("Range");

	// handle range requests
	if (range) {
		const [, start, end] = range.match(/bytes=(\d+)-(\d+)?/) || [];
		const startByte = parseInt(start, 10);
		const endByte = end ? parseInt(end, 10) : contentLength - 1;

		if (isNaN(startByte) || isNaN(endByte) || startByte >= contentLength || endByte >= contentLength) {
			// 416 range not satisfiable
			return new Response(null, {
				status: 416,
				headers: {
					"Content-Range": `bytes */${contentLength}`,
				},
			});
		}

		const fileStream = fs.createReadStream(filePath, { start: startByte, end: endByte });

		// @ts-expect-error node readstream is compatible
		return new Response(fileStream, {
			status: 206,
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": (endByte - startByte + 1).toString(),
				"Content-Range": `bytes ${startByte}-${endByte}/${contentLength}`,
				"Accept-Ranges": "bytes",
			},
		});
	}

	// handle full file request (no range)
	const fileStream = fs.createReadStream(filePath);
	// @ts-expect-error node readstream is compatible
	return new Response(fileStream, {
		status: 200,
		headers: {
			"Content-Type": "audio/mpeg",
			"Content-Length": contentLength.toString(),
			"Accept-Ranges": "bytes",
		},
	});
}
