import type {Corner} from './corner';

export class Wall {
    private corner: Corner;
    private doorSpaces;
    private windowSpaces;
    constructor( corner: Corner, doorSpaces?, windowSpaces? ) {
        this.corner = corner;
        this.doorSpaces = doorSpaces || [];
        this.windowSpaces = windowSpaces || [];
    }

}