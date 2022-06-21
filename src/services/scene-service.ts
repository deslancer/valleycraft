import * as BABYLON from 'babylonjs';
import { EngineService } from "./engine-service";


export class SceneService {
    private engineService: EngineService;
    private scene: BABYLON.Scene;
    constructor( canvas ) {
        this.engineService = new EngineService(canvas);
        this.scene = new BABYLON.Scene(this.engineService.getEngine());
        this.scene.clearColor = new BABYLON.Color4( 1.0, 1.0, 1.0, 1.0 ).toLinearSpace();
    }

}