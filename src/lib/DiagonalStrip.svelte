<script lang="ts">
	let { src, class: className = "" } = $props();

	let canvas: HTMLCanvasElement;
	let container: HTMLDivElement;
	let isLoaded = $state(false);

	// loads an image and processes it to create a diagonal pixel strip effect on a canvas
	$effect(() => {
		if (!src || !canvas) return;

		// reset loaded state when src changes
		isLoaded = false;

		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = src;

		img.onload = () => {
			if (!canvas) return;

			// we create a strip that has the width of the image but only 1px height
			// the browser will stretch this 1px height to fill the container,
			// effectively "duplicating the line"
			const w = img.width;
			const h = img.height;

			// limit processing size for performance if image is huge
			const maxW = 500;
			const processW = Math.min(w, maxW);
			const processH = Math.floor(processW * (h / w));

			canvas.width = processW;
			canvas.height = 1;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			// use an offscreen canvas to read pixels
			const offCanvas = document.createElement("canvas");
			offCanvas.width = processW;
			offCanvas.height = processH;
			const offCtx = offCanvas.getContext("2d");
			if (!offCtx) return;

			offCtx.drawImage(img, 0, 0, processW, processH);
			const imageData = offCtx.getImageData(0, 0, processW, processH);
			const data = imageData.data;

			// create output buffer
			const outputImageData = ctx.createImageData(processW, 1);
			const outputData = outputImageData.data;

			for (let x = 0; x < processW; x++) {
				// diagonal sampling: y is proportional to x
				const y = Math.floor(x * (processH / processW));

				// get pixel index in source
				const i = (y * processW + x) * 4;

				// set pixel in target (row 0, col x)
				const targetI = x * 4;
				outputData[targetI] = data[i]; // R
				outputData[targetI + 1] = data[i + 1]; // G
				outputData[targetI + 2] = data[i + 2]; // B
				outputData[targetI + 3] = data[i + 3]; // A
			}

			ctx.putImageData(outputImageData, 0, 0);
			isLoaded = true;
		};
	});
</script>

<div class={className} bind:this={container}>
	<!-- the canvas is stretched to fill the container -->
	<canvas
		bind:this={canvas}
		class="block h-full w-full"
		style="image-rendering: pixelated; opacity: {isLoaded ? 1 : 0}; transition: opacity 0.3s;">
	</canvas>
</div>
