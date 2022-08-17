import * as BABYLON from 'babylonjs';
import { DeviceIdentifierHelper } from "./device-identifier-helper";

export class EngineService{
    private readonly engine: any;
    private deviceIdentifier = new DeviceIdentifierHelper();
    constructor(canvas){
        this.engine = new BABYLON.Engine(canvas, true);

        window.addEventListener('resize', () => {
            this.engine.resize();
          });
    }
    getEngine(){
        return this.engine;
    }

}
