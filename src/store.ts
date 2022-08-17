import { writable } from "svelte/store";

export const global_scene = writable( {});
export const coordinatesArr = writable([]);
export const gridRatio = writable(0.5);