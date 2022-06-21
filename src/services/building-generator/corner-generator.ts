import { Corner } from "./corner";

export class CornerGenerator {
    private corners: Array<Corner> = [];

    constructor( baseData ) {
        this.generateCorners(baseData)
    }

    private generateCorners( baseData ) {

        for ( let i = 0; i < baseData.length / 2; i++ ) {
            this.corners.push( new Corner( baseData[ 2 * i ], baseData[ 2 * i + 1 ] ) );
        }

        console.group("First step")
        console.info('Create an array of Vector3 coordinates')
        console.log(this.corners)
        console.groupEnd()
    }
    getCorners() {
        return this.corners;
    }
}