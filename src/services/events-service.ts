import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import {coordinatesArr} from "../store";

export class EventsService {
    private readonly scene: BABYLON.Scene;
    private lines;
    private linePoints = [];
    private dots = [];
    private positions;
    private advancedDynamicTexture;

    constructor(scene) {
        this.scene = scene;
        this.advancedDynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    }
    addLine(){
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


        scene.onPointerDown = (evt) => {
            const pickedResult = scene.pick(scene.pointerX, scene.pointerY);
            if (this.lines) {
                this.lines.dispose();
            }
            if(pickedResult) {
                this.linePoints.push(pickedResult.pickedPoint);
                this.lines = BABYLON.MeshBuilder.CreateLines("lines", {
                    points: this.linePoints,
                    updatable: true
                });
                let dot = BABYLON.MeshBuilder.CreateSphere(`dot`, {diameter: 0.1});
                dot.position = pickedResult.pickedPoint;
                this.dots.push(dot);
                this.positions = this.lines.getVerticesData(BABYLON.VertexBuffer.PositionKind);

            }
        }
        scene.onPointerMove = (evt) => {
            const pickedResult = scene.pick(scene.pointerX, scene.pointerY);

            if (pickedResult.hit && this.lines) {
                let prev_x = this.positions[this.positions.length-6];
                let prev_z = this.positions[this.positions.length-4];
                let prev_position = new BABYLON.Vector3(
                    this.positions[this.positions.length-6],
                    this.positions[this.positions.length-5],
                    this.positions[this.positions.length-4]
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
                this.positions[this.positions.length-1] = pickedResult.pickedPoint.z;
                this.positions[this.positions.length-2] = pickedResult.pickedPoint.y;
                this.positions[this.positions.length-3] = pickedResult.pickedPoint.x;
                if(curr_x > (prev_x - 0.15) && curr_x < (prev_x + 0.15)) {
                    lineX.x1 = coordinates.x;
                    lineX.x2 = coordinates.x;
                    lineX.isVisible = true;
                    this.positions[this.positions.length-3] = prev_x;
                }else{
                    lineX.isVisible = false;
                }
                if(curr_z > (prev_z - 0.15) && curr_z < (prev_z + 0.15)) {
                    lineY.y1 = coordinates.y;
                    lineY.y2 = coordinates.y;
                    lineY.isVisible = true;
                    this.positions[this.positions.length-1] = prev_z;
                }else{
                    lineY.isVisible = false;
                }
                this.lines.updateVerticesData(BABYLON.VertexBuffer.PositionKind, this.positions);
                if(this.linePoints.length < 2) {
                    this.linePoints.push(pickedResult.pickedPoint);
                    this.lines = BABYLON.MeshBuilder.CreateLines("lines", {
                        points: this.linePoints,
                        updatable: true
                    });
                }
                this.linePoints.pop();
                this.linePoints.push(pickedResult.pickedPoint);

            }

        }
    }
    undo(){
        if (this.lines && this.linePoints.length > 2) {
            this.lines.dispose();
            this.linePoints.pop();
            this.lines = BABYLON.MeshBuilder.CreateLines("lines", {
                points: this.linePoints,
                updatable: true
            });

            this.dots[this.dots.length-1].dispose();
            this.dots.pop();
            this.positions = this.lines.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        }

    }
}