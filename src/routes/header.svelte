<!-- Copyright © 2025 Lucca Vitters. All rights reserved -->

<script>
	import { page } from '$app/stores';
</script>

<div class="my-7 ml-7 flex items-center max-md:mx-4 max-md:mt-7 max-md:py-0">
	<a href="https://zfk-hb.de" class="flex cursor-default items-center">
		<img src="/logo_zfk_transparent.png" alt="ZfK Logo" class="h-[100px] w-auto cursor-pointer" />
	</a>
	<nav class="ml-6 flex gap-6 text-2xl">
		<a
			href="/events"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith('/events')}>Veranstaltungen</a
		>
		<a
			href="/club"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith('/club')}>Info</a
		>
		<a
			href="/recordings"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith('/recordings')}>Aufnahmen</a
		>
		<a
			href="/selbstverständnis"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith('/selbstverständnis')}>Selbstverständnis</a
		>
		<a
			href="/impressum"
			class="cursor-pointer hover:underline"
			class:underline={$page.url.pathname.startsWith('/impressum')}>Impressum</a
		>
	</nav>
</div>
