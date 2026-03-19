import { writable, type Writable } from "svelte/store";

const getInitialDarkMode = () => {
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem("isDarkMode");
		if (stored !== null) return stored === "true";
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	return true;
};

export const isDarkMode = writable(getInitialDarkMode());

if (typeof window !== "undefined") {
	isDarkMode.subscribe((value) => {
		localStorage.setItem("isDarkMode", String(value));
	});
}

const getInitialSoundCloudConsent = () => {
	if (typeof window !== "undefined") {
		return localStorage.getItem("soundCloudConsent") === "true";
	}
	return false;
};

export const soundCloudConsent = writable(getInitialSoundCloudConsent());

if (typeof window !== "undefined") {
	soundCloudConsent.subscribe((value) => {
		localStorage.setItem("soundCloudConsent", String(value));
	});
}

export const pendingConsentTrackId: Writable<string | null> = writable(null);

export const lightboxImage: Writable<string | null> = writable(null);
