import type { ILineCreateService } from "../../interfaces/ILineCreateService";
import type { IGuideLinesCreator } from "../../interfaces/IGuideLinesCreator";
import * as BABYLON from "babylonjs";
import { coordinatesArr, gridRatio } from "../../store";

export class LineCreatorService implements ILineCreateService {
    private isLineClosed: boolean;
    private lines;
    private helperLines;
    private linePoints: Array<BABYLON.Vector3> = [];
    private lineColor: BABYLON.Color3 = new BABYLON.Color3( 0, 0, 0 );
    private readonly scene: any;
    private isSnappedX: boolean = false;
    private isSnappedZ: boolean = false;
    private guideLines: IGuideLinesCreator;
    snapDistance: number = 0.2;
    isGridSnapEnabled: boolean = false;
    constructor( scene, guideLines: IGuideLinesCreator ) {
        this.scene = scene;
        this.guideLines = guideLines;
    }

    create(): object {
        const pickedResult = this.scene.pick( this.scene.pointerX, this.scene.pointerY );
        if ( this.lines ) {
            this.lines.dispose();
        }
        if ( pickedResult ) {
            let pickedPoint = pickedResult.pickedPoint;
            this.linePoints.push( pickedPoint );
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                points: this.linePoints,
                updatable: true
            } );
            this.lines.color = this.lineColor;
            this.createHelperLines();
        }
        if ( !this.guideLines.isGuidesExists() ) {
            this.guideLines.createX();
            this.guideLines.createY();
        }
        coordinatesArr.update( () => {
            return this.linePoints;
        } )
        return this
    }

    update(): object {
        const pickedResult = this.scene.pick( this.scene.pointerX, this.scene.pointerY );

        if ( pickedResult.pickedPoint && this.lines ) {
            if ( this.linePoints && this.linePoints.length < 2 ) {
                this.linePoints.push( pickedResult.pickedPoint );
                this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                    points: this.linePoints,
                    updatable: true
                } );
            }
            const options = {
                points: this.linePoints,
                instance: this.lines
            }
            options.points[ this.linePoints.length - 1 ] = pickedResult.pickedPoint;
            const snapPointX = this.snapX( pickedResult.pickedPoint );
            const snapPointZ = this.snapZ( pickedResult.pickedPoint );

            this.closing( pickedResult.pickedPoint );
            if ( snapPointX ) {
                let guideXCoordinates = BABYLON.Vector3.Project( snapPointX,
                    BABYLON.Matrix.Identity(),
                    this.scene.getTransformMatrix(),
                    this.scene.activeCamera.viewport.toGlobal(
                        this.scene.getEngine().getRenderWidth(),
                        this.scene.getEngine().getRenderHeight(),
                    ) );
                this.isSnappedX = true;
                this.guideLines.showX();
                this.guideLines.setPositionX( guideXCoordinates.x );
                options.points[ this.linePoints.length - 1 ].x = snapPointX.x;
            } else {
                this.isSnappedX = false;
                this.guideLines.hideX();
            }
            if ( snapPointZ ) {
                let guideYCoordinates = BABYLON.Vector3.Project( snapPointZ,
                    BABYLON.Matrix.Identity(),
                    this.scene.getTransformMatrix(),
                    this.scene.activeCamera.viewport.toGlobal(
                        this.scene.getEngine().getRenderWidth(),
                        this.scene.getEngine().getRenderHeight(),
                    ) );
                this.isSnappedZ = true;
                this.guideLines.showY();
                this.guideLines.setPositionY( guideYCoordinates.y );
                options.points[ this.linePoints.length - 1 ].z = snapPointZ.z;
            } else {
                this.isSnappedZ = false;
                this.guideLines.hideY();
            }
            if(this.isGridSnapEnabled){
                const snapGridPoint = this.snapGrid(pickedResult.pickedPoint);
                options.points[ this.linePoints.length - 1 ].x = snapGridPoint.x;
                options.points[ this.linePoints.length - 1 ].z = snapGridPoint.y;
            }
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", options );
            this.lines.color = new BABYLON.Color3( 0, 0, 0 );
        }
        return this;
    }

    delete(): object {
        this.lines.dispose();
        this.linePoints = [];
        console.log( 'delete' )
        return this;
    }

    isClosed() {
        return this.isLineClosed;
    }

    removeLastPoint(): object {
        if ( this.lines && this.linePoints.length > 2 ) {
            this.lines.dispose();
            this.linePoints.pop();
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                points: this.linePoints,
                updatable: true
            } );
            this.lines.color = new BABYLON.Color3( 0, 0, 0 );
        }
        console.log( 'removed last point' )
        return this;
    }

    getPoints(): Array<BABYLON.Vector3> {
        console.log( ' getting line points' )
        return this.linePoints;
    }

    setLineColor( color: BABYLON.Color3 ): object {
        return this
    }
    toggleGridSnap(state){
        this.isGridSnapEnabled = state;
    }
    private snapGrid(pickedPoint: BABYLON.Vector3){
        let snapRatio;
        gridRatio.subscribe((value)=> (snapRatio = value));
        if(pickedPoint){
            let snap_candidate_x = snapRatio * Math.round(pickedPoint.x/snapRatio);
            let snap_candidate_z = snapRatio * Math.round(pickedPoint.z/snapRatio);
            const snapPoint = {
                x: 0,
                y: 0
            }
            if (Math.abs(pickedPoint.x-snap_candidate_x) < 2) {
                snapPoint.x = snap_candidate_x
            }
            if (Math.abs(pickedPoint.z-snap_candidate_z) < 2) {
                snapPoint.y = snap_candidate_z
            }
            return snapPoint;
        }

    }
    private snapX( pickedPoint: BABYLON.Vector3 ) {
        if ( pickedPoint ) {
            const points = this.linePoints.slice( 0, this.linePoints.length - 1 );
            const crossedVec = points.find( vec => vec.x > ( pickedPoint.x - this.snapDistance ) && vec.x < ( pickedPoint.x + this.snapDistance ) );
            if ( crossedVec ) {
                return crossedVec
            }
        }
        return null
    }

    private snapZ( pickedPoint: BABYLON.Vector3 ) {
        if ( pickedPoint ) {
            const points = this.linePoints.slice( 0, this.linePoints.length - 1 );
            const crossedVec = points.find( vec => vec.z > ( pickedPoint.z - this.snapDistance ) && vec.z < ( pickedPoint.z + this.snapDistance ) );
            if ( crossedVec ) {
                return crossedVec
            }
        }
        return null
    }

    private closing( pickedPoint: BABYLON.Vector3 ): object {
        const firstPoint = this.linePoints[ 0 ];
        // if picked point is equal to first point BABYLON.Vector3.Distance returns an error
        if ( !pickedPoint.equals( firstPoint ) ) {
            const distance = BABYLON.Vector3.Distance( firstPoint, pickedPoint )
            if ( distance <= this.snapDistance && this.linePoints.length > 4 ) {
                this.isLineClosed = true;
                this.guideLines.removeAll();
            }
        }

        return this;
    }
    private createHelperLines(){
        let prevPoint;
        if(this.linePoints.length === 1){
            prevPoint = this.linePoints[0]
        }else {
            prevPoint = this.linePoints[this.linePoints.length - 2];
        }

        const nextPoint = this.linePoints[this.linePoints.length - 1];

        const points = [
            new BABYLON.Vector3(prevPoint.x, 0, prevPoint.z),
            new BABYLON.Vector3(prevPoint.x, 0, prevPoint.z + 0.5)
        ];
        
        const options = {
            points: points,
            updatable: true
        }

        this.helperLines = BABYLON.MeshBuilder.CreateLines("helper_line1", options);
        this.helperLines.color = new BABYLON.Color3( 0, 0, 0 );
    }
}