<!-- tailwindcss -->
<script>
	let { children } = $props();
	import "../app.css";
	import AudioPlayer from "./audioPlayer.svelte";
</script>

{@render children()}

<AudioPlayer />