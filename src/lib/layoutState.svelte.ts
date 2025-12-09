import { type Snippet } from 'svelte';

let navBottomSnippet = $state<Snippet | null>(null);

export function getNavBottom() {
	return navBottomSnippet;
}

export function setNavBottom(s: Snippet | null) {
	navBottomSnippet = s;
}