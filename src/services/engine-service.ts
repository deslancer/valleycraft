import * as BABYLON from 'babylonjs';
import {DeviceIdentifierHelper} from "./device-identifier-helper";

export class EngineService{
    private readonly engine: any;
    private deviceIdentifier = new DeviceIdentifierHelper();
    constructor(canvas){
        this.engine = new BABYLON.Engine(canvas, !this.deviceIdentifier.isIOS());
        // TODO 'Hotfix for IOS 15.4.1, remove when updated to 15.4.2'
        console.log('Hotfix for IOS 15.4.1, remove when updated to 15.4.2')
        window.addEventListener('resize', () => {
            this.engine.resize();
          });
    }
    getEngine(){
        return this.engine;
    }

}
