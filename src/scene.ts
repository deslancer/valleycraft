import * as BABYLON from 'babylonjs';
import { EngineService } from './services/engine-service';
import { CameraService } from './services/camera-service';
import { LightService } from './services/light-service';
import { LoaderService } from './services/loader-service';
import { MaterialsService } from "./services/materials-service";
import { EnvironmentService } from "./services/environment-service";
import { EventsService } from "./services/events-service";
import { BuildingCreatorService } from "./services/3D/building-creator-service";
import { global_scene } from './store';
import { LineCreatorService } from "./services/2D/line-creator-service";
import hotkeys from 'hotkeys-js';
import { GuideLinesService } from "./services/2D/guide-lines-service";

export const createScene = async ( canvas ) => {

    const engine = new EngineService( canvas ).getEngine();
    const scene = new BABYLON.Scene( engine );

    const cameraService = new CameraService( canvas, scene );
    const lightService = new LightService( scene );
    const materialService = new MaterialsService( scene );
    lightService.createHemisphericLight();
    const loaderService = new LoaderService( scene );
    const envService = new EnvironmentService( scene, materialService, loaderService );
    //scene.clearColor = new BABYLON.Color4( 0.4, 0.4, 0.42, 1.0 ).toLinearSpace();
    scene.clearColor = new BABYLON.Color4( 1.0, 1.0, 1.0, 1.0 ).toLinearSpace();
    cameraService.createPerspectiveCam();
    cameraService.createOrthoCamera();


    loaderService.loadAll();
    materialService.createGridMaterial();
    materialService.createShadowOnlyMaterial();
    envService.createHDREnvironment()
    envService.createGround();
    envService.createGrid();

/////////////////////////////////////////////////////////////////////
    const guideLinesService = new GuideLinesService(scene);
    const lineCreatorService = new LineCreatorService( scene, guideLinesService);
    const eventService = new EventsService( scene, lineCreatorService );
    const buildingCreator = new BuildingCreatorService();

    scene.setActiveCameraByName( 'ortho' )

    loaderService.assetsManager.onFinish = () => {
        engine.runRenderLoop( function () {
            scene.render();
        } );
    };
    new BABYLON.AxesViewer( scene, 1.5 );

    global_scene.update( () => {
        return scene;
    } )

    hotkeys('ctrl+alt+i', function (event, handler){
        if ( scene.debugLayer.isVisible() ) {
            scene.debugLayer.hide();
        } else {
            scene.debugLayer.show( {
                globalRoot: document.body,
                overlay: true
            } );
        }
    });
    return scene;
}
