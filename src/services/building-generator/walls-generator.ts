import { Wall } from "./wall";
import { Door } from "./door";
import { DoorSpace } from "./doorSpace";
import { Window } from "./window";
import { WindowSpace } from "./windowSpace";

export class WallsGenerator {
    private walls: Array<any> = [];

    constructor( corners ) {
        this.generateWalls( corners )
    }

    private generateWalls( corners ) {
        for ( let i = 0; i < corners.length; i++ ) {
            this.walls.push( new Wall( corners[ i ] ) );
        }
        if ( this.walls.length > 8 ) {
            const door = new Door( 1, 1.8 );
            const doorSpace = new DoorSpace( door, 1 );

            const window0 = new Window( 1.2, 1.4 );
            const window1 = new Window( 1, 1.4 );

            const windowSpace02 = new WindowSpace( window0, 0.814, 0.4 );
            const windowSpace1 = new WindowSpace( window0, 0.4, 0.4 );
            const windowSpace78 = new WindowSpace( window1, 1.5, 0.4 );
            this.walls[ 0 ].windowSpaces = [ windowSpace02 ];
            this.walls[ 1 ].windowSpaces = [ windowSpace1 ];
            this.walls[ 2 ].windowSpaces = [ windowSpace02 ];
            this.walls[ 7 ].windowSpaces = [ windowSpace78 ];
            this.walls[ 8 ].windowSpaces = [ windowSpace78 ];
            this.walls[ 5 ].doorSpaces = [ doorSpace ];
        }


        console.group( "Second step" )
        console.info( 'Create walls from array of corners' )
        console.log( this.walls )
        console.groupEnd()
    }

    getWalls() {
        return this.walls;
    }
}