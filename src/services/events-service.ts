import { PolygonCreatorService } from "./2D/polygon-creator-service"
import type { ILineCreateService } from "../interfaces/ILineCreateService";
import hotkeys from 'hotkeys-js';

export class EventsService {
    private scene;
    private readonly lineCreator: ILineCreateService;
    private readonly polygonCreator: PolygonCreatorService;

    constructor( scene: any, lineCreator: ILineCreateService ) {
        this.scene = scene;
        this.lineCreator = lineCreator;
        this.polygonCreator = new PolygonCreatorService( scene );
        this.onPointerDown();
        this.onPointerMove();
        this.undo();
        this.gridSnap();
    }

    onPointerDown() {
        this.scene.onPointerDown = ( evt ) => {
            this.lineCreator.create();
            this.onClosingLine();
        }
    }

    onPointerMove() {
        this.scene.onPointerMove = ( evt ) => {

            this.lineCreator.update();
            this.onClosingLine();

        }
    }

    onClosingLine() {
        if ( this.lineCreator.isClosed() ) {
            this.scene.onPointerMove = null;
            this.scene.onPointerDown = null;
            this.polygonCreator.createPolygon( this.lineCreator.getPoints() );
        }
    }

    undo() {
        hotkeys('ctrl+z', function (event, handler){
           this.lineCreator.removeLastPoint()
        }.bind(this));
    }
    gridSnap(){
        let state = true;
        hotkeys('g', function (event, handler){
            state =!state;
            this.lineCreator.toggleGridSnap(state);
        }.bind(this));
    }
}
