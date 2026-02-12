import { writable, type Writable } from "svelte/store";

const getInitialDarkMode = () => {
	if (typeof window !== "undefined") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	return true;
};

export const isDarkMode = writable(getInitialDarkMode());

export const lightboxImage: Writable<string | null> = writable(null);
