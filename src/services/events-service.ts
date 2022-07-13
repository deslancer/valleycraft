import { LineCreatorService } from "./2D/line-creator-service";
import { PolygonCreatorService } from "./2D/polygon-creator-service"

export class EventsService {
    private scene;
    private readonly lineCreator: LineCreatorService;
    private readonly polygonCreator: PolygonCreatorService;
    constructor(scene) {
        this.scene = scene;
        this.lineCreator = new LineCreatorService(scene);
        this.polygonCreator = new PolygonCreatorService(scene);
        this.onPointerDown();
        this.onPointerMove();
        this.undo();

    }

    onPointerDown(){
        this.scene.onPointerDown = (evt) => {

            this.lineCreator.createLines();
            this.onClosingLine();
        }
    }
    onPointerMove(){
        this.scene.onPointerMove = (evt) => {
            this.lineCreator.updateLines();
            this.onClosingLine();
        }
    }
    onClosingLine(){
        if(this.lineCreator.closedLines()){
            this.scene.onPointerMove = null;
            this.scene.onPointerDown = null;
            this.polygonCreator.createPolygon(this.lineCreator.getLinePoints());
        }
    }
    undo(){
        const lineCreator = this.lineCreator
        document.onkeyup = function( e ) {
            const evt = window.event || e;
            // @ts-ignore
            if ( evt.keyCode == 90 && evt.ctrlKey) {
                lineCreator.removeLastLine();
            }

        };
    }
}
