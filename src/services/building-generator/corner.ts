import * as BABYLON from 'babylonjs'

export class Corner {
    constructor( x: number, y: number ) {
        return new BABYLON.Vector3( x, 0, y );
    }
}