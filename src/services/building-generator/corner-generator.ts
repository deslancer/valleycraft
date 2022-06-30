import { Corner } from "./corner";

export class CornerGenerator {
    private corners: Array<any> = [];

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
    getCorners(is2D?) {
        if(is2D){
            this.corners.push(this.corners[0])
        }
        return this.corners;
    }
}