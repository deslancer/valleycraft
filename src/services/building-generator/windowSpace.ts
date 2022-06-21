import { Window } from "./window";

export class WindowSpace {
        private window: Window;
        private left: number;
        private top: number;
    constructor(window: Window, left: number, top: number) {
        this.window = window;
        this.left = left;
        this.top = top;
    }
}