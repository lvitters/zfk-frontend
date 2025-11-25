<!-- tailwindcss -->
<script>
	let { children } = $props();
	import "../app.css";
	import AudioPlayer from "./audioPlayer.svelte";
	import Header from "./header.svelte";
</script>

<Header />

{@render children()}

<AudioPlayer />