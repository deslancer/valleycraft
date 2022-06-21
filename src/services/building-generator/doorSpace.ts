import { Door } from "./door";

export class DoorSpace {
    private door;
    private left;
    constructor(door: Door, left: number) {
        this.door = door;
        this.left = left;
    }
}