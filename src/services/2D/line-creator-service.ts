import BABYLON from "babylonjs";
import { GuideLinesService } from "./guide-lines-service";
import { coordinatesArr } from "../../store";
import { LabelsService } from "./labels-service";
import { SizeHelper } from "./size-helper";
import { GeometryHelper } from "./geometry-helper";

export class LineCreatorService {
    private readonly scene;
    private lines;
    private linePoints: Array<BABYLON.Vector3> = [];
    private dots = [];
    private positions;
    private lastPoint = null;
    private guideLines: GuideLinesService;
    private crossX: boolean = false;
    private lineIsClosed: boolean = false;
    private labelsService: LabelsService;
    private sizeHelper: SizeHelper;
    private geometryHelper: GeometryHelper;

    constructor( scene ) {
        this.scene = scene;
        this.guideLines = new GuideLinesService( scene );
        this.labelsService = new LabelsService( this.scene );
        this.sizeHelper = new SizeHelper();
        this.geometryHelper = new GeometryHelper();
    }

    createLines() {
        const pickedResult = this.scene.pick( this.scene.pointerX, this.scene.pointerY );
        if ( this.lines ) {
            this.lines.dispose();
        }
        if ( pickedResult ) {
            let pickedPoint = pickedResult.pickedPoint;
            if ( this.lastPoint && this.crossX ) {
                console.log( this.lastPoint )
                console.log( this.linePoints )
                pickedPoint.x = this.lastPoint.x;
            }
            this.linePoints.push( pickedPoint );
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                points: this.linePoints,
                updatable: true
            } );
            this.lines.color = new BABYLON.Color3( 0, 0, 0 );
            coordinatesArr.update( () => {
                return this.linePoints;
            } )
            this.lastPoint = pickedPoint;
            this.positions = this.lines.getVerticesData( BABYLON.VertexBuffer.PositionKind );
        }
        return
    }

    updateLines() {
        const pickedResult = this.scene.pick( this.scene.pointerX, this.scene.pointerY );

        if ( pickedResult.hit && this.lines ) {
            if ( this.linePoints.length < 2 ) {
                this.linePoints.push( pickedResult.pickedPoint );
                this.lines = BABYLON.MeshBuilder.CreateLines( "lines", {
                    points: this.linePoints,
                    updatable: true
                } );
            } else {
                this.crossXDetect( pickedResult )
            }

            const options = {
                points: this.linePoints,
                instance: this.lines
            }
            options.points[ this.linePoints.length - 1 ] = pickedResult.pickedPoint;
            this.lines = BABYLON.MeshBuilder.CreateLines( "lines", options );
            this.lines.color = new BABYLON.Color3( 0, 0, 0 );
        }
        return this
    }

    closedLines(): boolean {
        return this.lineIsClosed
    }

    deleteLines() {
        this.lines.dispose();
    }

    getLines() {

    }

    getLinePoints(): Array<BABYLON.Vector3> {
        return this.linePoints
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

    crossXDetect( pickedResult ) {
        let prev_position = this.linePoints[ this.linePoints.length - 2 ];
        let firstPoint = this.linePoints[ 0 ];
        let minDistance = 0.1;
        let distFirstCurrent = BABYLON.Vector3.Distance( firstPoint, pickedResult.pickedPoint )

        let curr_x = pickedResult.pickedPoint.x;
        let curr_z = pickedResult.pickedPoint.z;
        let coordinates = BABYLON.Vector3.Project( prev_position,
            BABYLON.Matrix.Identity(),
            this.scene.getTransformMatrix(),
            this.scene.activeCamera.viewport.toGlobal(
                this.scene.getEngine().getRenderWidth(),
                this.scene.getEngine().getRenderHeight(),
            ) );


        if ( curr_x > ( prev_position.x - 0.15 ) && curr_x < ( prev_position.x + 0.15 ) ) {
            this.guideLines.getLineX().x1 = coordinates.x;
            this.guideLines.getLineX().x2 = coordinates.x;
            this.guideLines.getLineX().isVisible = true;
            this.positions[ this.positions.length - 3 ] = prev_position.x;
            this.crossX = true;
        } else {
            this.guideLines.getLineX().isVisible = false;
            this.crossX = false;
        }
        if ( curr_z > ( prev_position.z - 0.15 ) && curr_z < ( prev_position.z + 0.15 ) ) {
            this.guideLines.getLineY().y1 = coordinates.y;
            this.guideLines.getLineY().y2 = coordinates.y;
            this.guideLines.getLineY().isVisible = true;
            this.positions[ this.positions.length - 1 ] = prev_position.z;
        } else {
            this.guideLines.getLineY().isVisible = false;
        }
        ////////
        if ( distFirstCurrent <= minDistance && this.linePoints.length > 4 ) {
            this.linePoints[ this.linePoints.length - 1 ] = firstPoint;
            this.lineIsClosed = true;
            //console.log( this.sizeHelper.getFloorArea( this.linePoints ) );
            const floorArea = this.sizeHelper.getFloorArea( this.linePoints );
            const labelCenter = this.geometryHelper.getPolygonCenter( this.linePoints )

            this.labelsService.createLabel( `${ this.sizeHelper.convertM2ToFT2( floorArea ) } ft²`, labelCenter )

        } else {
            this.lineIsClosed = false;
        }
    }
}