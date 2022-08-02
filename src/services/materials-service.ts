import * as BABYLON from 'babylonjs';
import * as Materials from 'babylonjs-materials';
import type { IMaterialService } from '../interfaces/IMaterialService';

export class MaterialsService implements IMaterialService {
    private readonly scene: any;
    private gridMat: any;
    private shadowOnlyMat: any;

    constructor( scene ) {
        this.scene = scene;
    }

    createGridMaterial() {
        let grid_material = new Materials.GridMaterial( "gridMaterial", this.scene );
        grid_material.opacity = 0.99;
        grid_material.mainColor = new BABYLON.Color3( 0.72, 0.72, 0.72 );
        grid_material.mainColor = new BABYLON.Color3( 0.82, 0.82, 0.82 );
        grid_material.gridOffset = new BABYLON.Vector3( 0.5, 0, 0 );
        grid_material.gridRatio = 0.5;
        grid_material.majorUnitFrequency = 1000;
        this.gridMat = grid_material;
    }

    createShadowOnlyMaterial() {
        this.shadowOnlyMat = new Materials.ShadowOnlyMaterial( 'shadowOnly', this.scene );
    }

    get gridMaterial() {
        return this.gridMat;
    }

    get shadowOnlyMaterial() {
        return this.shadowOnlyMat;
    }
}
