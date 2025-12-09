import { type Snippet } from 'svelte';

let navBottomSnippet = $state<Snippet | null>(null);
let currentNavHeight = $state(0); // New state for nav height

export function getNavBottom() {
	return navBottomSnippet;
}

export function setNavBottom(s: Snippet | null) {
	navBottomSnippet = s;
}

export function getNavHeight() { // New getter for nav height
    return currentNavHeight;
}

export function setNavHeight(height: number) { // New setter for nav height
    currentNavHeight = height;
}