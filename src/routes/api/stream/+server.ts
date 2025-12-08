import fs from "fs";
import path from "path";
import { error } from "@sveltejs/kit";

export async function GET({ url, request }) {
	const filePath = url.searchParams.get("file");

	if (!filePath) {
		throw error(400, "Missing file parameter");
	}

	// Security: Prevent directory traversal and ensure we only serve from zfk-backend/media
	// Resolve relative to zfk-frontend root (where package.json is)
	// We assume zfk-backend is a sibling of zfk-frontend
	const backendMediaDir = path.resolve("..", "zfk-backend"); 
	
	const requestedPath = path.resolve(backendMediaDir, filePath);
	
	console.log("Stream Debug:");
	console.log("CWD:", process.cwd());
	console.log("Backend Media Dir:", backendMediaDir);
	console.log("Requested Path:", requestedPath);
	console.log("Exists:", fs.existsSync(requestedPath));

	// Ensure the resolved path is actually inside zfk-backend
	if (!requestedPath.startsWith(backendMediaDir)) {
		console.error("Path traversal attempt:", requestedPath);
		throw error(403, "Forbidden");
	}

	if (!fs.existsSync(requestedPath)) {
		// Fallback: Check if the file exists in the content source folder
		// The structure in media is .../HASH/filename.mp3
		// The structure in content is .../content/2_aufnahmen/filename.mp3
		
		const filename = path.basename(requestedPath);
		// We know 'zfk-backend' is the parent of 'media', so we can find 'content' relative to it
		const contentDir = path.resolve(backendMediaDir, "content/2_aufnahmen");
		const fallbackPath = path.join(contentDir, filename);

		console.log("Checking fallback path:", fallbackPath);

		if (fs.existsSync(fallbackPath)) {
			console.log("Found in content fallback!");
			// We can serve this file instead.
			// We need to re-assign requestedPath, but it's const.
			// Let's create a new variable 'finalPath'
			return serveFile(fallbackPath, request);
		}

		console.error("File not found in media or content:", requestedPath);
		throw error(404, "File not found");
	}

	return serveFile(requestedPath, request);
}

function serveFile(filePath, request) {
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
             // 416 Range Not Satisfiable
             return new Response(null, {
                 status: 416,
                 headers: {
                     "Content-Range": `bytes */${contentLength}`
                 }
             });
        }

		const fileStream = fs.createReadStream(filePath, { start: startByte, end: endByte });

		// @ts-expect-error Node ReadStream is compatible
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

	// Handle full file request (no range)
	const fileStream = fs.createReadStream(filePath);
	// @ts-expect-error Node ReadStream is compatible
	return new Response(fileStream, {
		status: 200,
		headers: {
			"Content-Type": "audio/mpeg",
			"Content-Length": contentLength.toString(),
			"Accept-Ranges": "bytes",
		},
	});
}