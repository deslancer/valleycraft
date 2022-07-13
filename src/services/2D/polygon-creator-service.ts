import * as BABYLON from 'babylonjs';
import earcut from "earcut";

export class PolygonCreatorService {
    private polygon: BABYLON.Mesh;
    private readonly scene: BABYLON.Scene;
    constructor(scene) {
        this.scene = scene;
    }
    createPolygon(vectors: Array<BABYLON.Vector3>){
        this.polygon = BABYLON.MeshBuilder.CreatePolygon("polygon",
            {shape:vectors,  sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene, earcut);
    }
    getPolygon(){
        return this.polygon;
    }
}