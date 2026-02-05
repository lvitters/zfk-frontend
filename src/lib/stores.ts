import { writable, type Writable } from "svelte/store";
import type { Track } from "./types";

export const currentTrack: Writable<Track | null> = writable(null);
export const isPlaying = writable(false);
export const isDarkMode = writable(true);

export const lightboxImage: Writable<string | null> = writable(null);
