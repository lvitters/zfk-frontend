import fs from "fs";
import path from "path";

export async function GET({ params, request }) {
	// prevent directory traversal
	const safeFilename = params.filename.replace(/\.\./g, "");
	const fullFilePath = path.resolve("db/audio", ...safeFilename.split("/"));

	// get file stats for range request handling
	const stats = fs.statSync(fullFilePath); // get file stats
	const contentLength = stats.size; // content length in bytes
	const range = request.headers.get("Range"); // get the range from the request

	// handle range requests
	if (range) {
		// if range is requested, parse the range and serve the appropriate bytes
		const [, start, end] = range.match(/bytes=(\d+)-(\d+)?/) || [];
		const startByte = parseInt(start, 10);
		const endByte = end ? parseInt(end, 10) : contentLength - 1;
		const fileStream = fs.createReadStream(fullFilePath, { start: startByte, end: endByte });

		// ensure the response has the right status code and headers for partial content
		return new Response(fileStream, {
			status: 206, // Partial Content
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": endByte - startByte + 1, // adjust content-length
				"Content-Range": `bytes ${startByte}-${endByte}/${contentLength}`, // indicate byte range
				"Accept-Ranges": "bytes", // tell the client we're accepting range requests
			},
		});
	}
}
