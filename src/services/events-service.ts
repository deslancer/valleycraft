import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {coordinatesArr} from "../store";

export class EventsService {
    private readonly scene: BABYLON.Scene;
    private lines;
    private advancedDynamicTexture;
    constructor(scene) {
        this.scene = scene;
        this.advancedDynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    }
    addLine(){

        let lines;
        let linePoints = [];
        let positions;
        let scene = this.scene;

        const lineX = new GUI.Line();
        lineX.x1 = 500;
        lineX.y1 = 0;
        lineX.x2 = 500;
        lineX.y2 = 1000;
        lineX.lineWidth = 1.5;
        lineX.color = "blue";
        lineX.isVisible = false;
        this.advancedDynamicTexture.addControl(lineX);

        const lineY = new GUI.Line();
        lineY.x1 = 0;
        lineY.y1 = 500;
        lineY.x2 = 3000;
        lineY.y2 = 500;
        lineY.lineWidth = 1.5;
        lineY.color = "red";
        lineY.isVisible = false;
        this.advancedDynamicTexture.addControl(lineY);


        scene.onPointerDown = function(evt) {
            const pickedResult = scene.pick(scene.pointerX, scene.pointerY);
            if (lines) {
                lines.dispose();
            }
            if(pickedResult) {
                linePoints.push(pickedResult.pickedPoint);
                lines = BABYLON.MeshBuilder.CreateLines("lines", {
                    points: linePoints,
                    updatable: true
                });
                let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.1});
                sphere.position = pickedResult.pickedPoint;
                positions = lines.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            }
        }
        scene.onPointerMove = function(evt) {
            const pickedResult = scene.pick(scene.pointerX, scene.pointerY);

            if (pickedResult.hit && lines) {
                let prev_x = positions[positions.length-6];
                let prev_z = positions[positions.length-4];
                let prev_position = new BABYLON.Vector3(
                    positions[positions.length-6],
                    positions[positions.length-5],
                    positions[positions.length-4]
                )
                let curr_x = pickedResult.pickedPoint.x;
                let curr_z = pickedResult.pickedPoint.z;
                let coordinates = BABYLON.Vector3.Project(prev_position,
                    BABYLON.Matrix.Identity(),
                    scene.getTransformMatrix(),
                    scene.activeCamera.viewport.toGlobal(
                        scene.getEngine().getRenderWidth(),
                        scene.getEngine().getRenderHeight(),
                    ));
                positions[positions.length-1] = pickedResult.pickedPoint.z;
                positions[positions.length-2] = pickedResult.pickedPoint.y;
                positions[positions.length-3] = pickedResult.pickedPoint.x;
                if(curr_x > (prev_x - 0.15) && curr_x < (prev_x + 0.15)) {
                    lineX.x1 = coordinates.x;
                    lineX.x2 = coordinates.x;
                    lineX.isVisible = true;
                    positions[positions.length-3] = prev_x;
                }else{
                    lineX.isVisible = false;
                }
                if(curr_z > (prev_z - 0.15) && curr_z < (prev_z + 0.15)) {
                    lineY.y1 = coordinates.y;
                    lineY.y2 = coordinates.y;
                    lineY.isVisible = true;
                    positions[positions.length-1] = prev_z;
                }else{
                    lineY.isVisible = false;
                }
                lines.updateVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
                if(linePoints.length < 2) {
                    linePoints.push(pickedResult.pickedPoint);
                    lines = BABYLON.MeshBuilder.CreateLines("lines", {
                        points: linePoints,
                        updatable: true
                    });
                }
                linePoints.pop();
                linePoints.push(pickedResult.pickedPoint);

            }

        }
    }
}