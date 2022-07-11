import { LineCreatorService } from "./2D/line-creator-service";
import {coordinatesArr} from "../store";
import {global_scene} from "../store";

export class EventsService {
    private scene;
    private readonly lineCreator: LineCreatorService;
    constructor(scene) {
        this.scene = scene;
        this.lineCreator = new LineCreatorService(scene);
        this.onPointerDown();
        this.onPointerMove();
        this.undo();

    }

    onPointerDown(){
        this.scene.onPointerDown = (evt) => {
            this.lineCreator.createLines();
        }
    }
    onPointerMove(){
        this.scene.onPointerMove = (evt) => {
            this.lineCreator.updateLines();
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