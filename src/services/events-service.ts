import * as BABYLON from 'babylonjs';
import {coordinatesArr} from "../store";

export class EventsService {
    private readonly scene: BABYLON.Scene;
    private lines;
    constructor(scene) {
        this.scene = scene;
    }
    addDot(){
        /*this.scene.onPointerDown = (evt, pickResult: BABYLON.PickingInfo)=>{
            //console.log(pickResult.pickedPoint)
            //let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.3});
            //sphere.position = pickResult.pickedPoint;
            coordinatesArr.update((array) => {
                return [...array, pickResult.pickedPoint]
            })
        }*/
        let lines;
        let linePoints = [];
        this.scene.onPointerUp = function(evt, pickResult) {
            if(pickResult.hit) {
                linePoints.push(pickResult.pickedPoint);
                lines = BABYLON.MeshBuilder.CreateLines("lines", {
                    points: linePoints,
                    updatable: true
                });
                let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.1});
                sphere.position = pickResult.pickedPoint;
            }
        }
       /* this.scene.onPointerMove = function(evt, pickResult) {
            console.log(pickResult.ray.direction)
            let positions = lines.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                if ( lines && positions.length > 3) {
                    let arr = positions.slice(0, -3);
                    arr.push(pickResult.ray.direction)
                    console.log(arr)
                }
                /!*let lines = BABYLON.MeshBuilder.CreateLines("lines", {
                    points: current_points,
                    updatable: true
                })*!/;

        }*/
    }
}