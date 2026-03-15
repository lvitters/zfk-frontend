<script lang="ts">
	import ModeToggle from "$lib/components/ModeToggle.svelte";
</script>

<div class="fixed inset-0 flex flex-col items-center justify-center bg-(--bg-color) px-4">
	<div class="flex flex-col items-center gap-12 text-center">
		<div
			aria-label="ZfK Logo"
			class="h-64 w-64 bg-(--highlight-color)"
			style="mask-image: url('/logo_zfk_transparent.png');
					-webkit-mask-image: url('/logo_zfk_transparent.png');
					mask-size: contain;
					-webkit-mask-size: contain;
					mask-repeat: no-repeat;
					-webkit-mask-repeat: no-repeat;
					mask-position: center;
					-webkit-mask-position: center;">
		</div>

		<h1 class="text-2xl font-bold tracking-widest text-(--text-color) md:text-4xl">IM BAU</h1>
	</div>
</div>

<ModeToggle />
