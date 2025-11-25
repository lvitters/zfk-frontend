import { writable } from "svelte/store";

export const currentTrack = writable(null);
export const isPlaying = writable(false);
