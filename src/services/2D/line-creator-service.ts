
import BABYLON from "babylonjs";
import { GuideLinesService } from "./guide-lines-service";

export class LineCreatorService {
    private scene;
    private lines;
    private linePoints = [];
    private dots = [];
    private positions;
    private lastPoint = new BABYLON.Vector3(0,0,0);
    private guideLines: GuideLinesService;
    constructor(scene) {
        this.scene = scene;
        this.guideLines = new GuideLinesService(scene);
    }

    createLines() {
        const pickedResult = this.scene.pick( this.scene.pointerX, this.scene.pointerY );
        if ( this.lines ) {
            this.lines.dispose();
        }
        if ( pickedResult ) {
            this.linePoints.push( pickedResult.pickedPoint );
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                points: this.linePoints,
                updatable: true
            } );
            let dot = BABYLON.MeshBuilder.CreateSphere( `dot`, { diameter: 0.1 } );
            dot.position = pickedResult.pickedPoint;
            this.dots.push( dot );
            this.positions = this.lines.getVerticesData( BABYLON.VertexBuffer.PositionKind );
            this.lastPoint = pickedResult.pickedPoint;
            console.log(this.lastPoint)
        }
        return
    }

    updateLines() {
        const pickedResult = this.scene.pick( this.scene.pointerX, this.scene.pointerY );

        if ( pickedResult.hit && this.lines ) {
            let prev_x = this.positions[ this.positions.length - 6 ];
            let prev_z = this.positions[ this.positions.length - 4 ];
            let prev_position = new BABYLON.Vector3(
                this.positions[ this.positions.length - 6 ],
                this.positions[ this.positions.length - 5 ],
                this.positions[ this.positions.length - 4 ]
            )
            let curr_x = pickedResult.pickedPoint.x;
            let curr_z = pickedResult.pickedPoint.z;
            let coordinates = BABYLON.Vector3.Project( prev_position,
                BABYLON.Matrix.Identity(),
                this.scene.getTransformMatrix(),
                this.scene.activeCamera.viewport.toGlobal(
                    this.scene.getEngine().getRenderWidth(),
                    this.scene.getEngine().getRenderHeight(),
                ) );
            this.positions[ this.positions.length - 1 ] = pickedResult.pickedPoint.z;
            this.positions[ this.positions.length - 2 ] = pickedResult.pickedPoint.y;
            this.positions[ this.positions.length - 3 ] = pickedResult.pickedPoint.x;
            if ( curr_x > ( prev_x - 0.15 ) && curr_x < ( prev_x + 0.15 ) ) {
                this.guideLines.getLineX().x1 = coordinates.x;
                this.guideLines.getLineX().x2 = coordinates.x;
                this.guideLines.getLineX().isVisible = true;
                this.positions[ this.positions.length - 3 ] = prev_x;
            } else {
                this.guideLines.getLineX().isVisible = false;
            }
            if ( curr_z > ( prev_z - 0.15 ) && curr_z < ( prev_z + 0.15 ) ) {
                this.guideLines.getLineY().y1 = coordinates.y;
                this.guideLines.getLineY().y2 = coordinates.y;
                this.guideLines.getLineY().isVisible = true;
                this.positions[ this.positions.length - 1 ] = prev_z;
            } else {
                this.guideLines.getLineY().isVisible = false;
            }
            this.lines.updateVerticesData( BABYLON.VertexBuffer.PositionKind, this.positions );
            if ( this.linePoints.length < 2 ) {
                this.linePoints.push( pickedResult.pickedPoint );
                this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                    points: this.linePoints,
                    updatable: true
                } );
            }
            this.linePoints.pop();
            this.linePoints.push( pickedResult.pickedPoint );
        }
        return
    }

    deleteLines() {

    }

    getLines() {

    }

    removeLastLine() {
        if ( this.lines && this.linePoints.length > 2 ) {
            this.lines.dispose();
            this.linePoints.pop();
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                points: this.linePoints,
                updatable: true
            } );

            this.dots[ this.dots.length - 1 ].dispose();
            this.dots.pop();
            this.positions = this.lines.getVerticesData( BABYLON.VertexBuffer.PositionKind );
        }

    }

}