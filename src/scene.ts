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

export const createScene = async ( canvas ) => {

    const engine = new EngineService( canvas ).getEngine();
    const scene = new BABYLON.Scene( engine );

    const cameraService = new CameraService( canvas, scene );
    const lightService = new LightService( scene );
    const materialService = new MaterialsService( scene );
    lightService.createHemisphericLight();
    const loaderService = new LoaderService( scene );
    const envService = new EnvironmentService( scene, materialService, loaderService );
    scene.clearColor = new BABYLON.Color4( 0.4, 0.4, 0.42, 1.0 ).toLinearSpace();
    cameraService.createPerspectiveCam();
    cameraService.createOrthoCamera();


    loaderService.loadAll();
    materialService.createGridMaterial();
    materialService.createShadowOnlyMaterial();
    envService.createHDREnvironment()
    envService.createGround();
    envService.createGrid();

/////////////////////////////////////////////////////////////////////

    const eventService = new EventsService( scene );
    const buildingCreator = new BuildingCreatorService();

    const baseData = [ -3, -2, -1, -4, 1, -4, 3, -2, 5, -2, 5, 1, 2, 1, 2, 3, -3, 3 ];

    scene.setActiveCameraByName( 'ortho' )
    //buildingCreator.build( scene );

    loaderService.assetsManager.onFinish = () => {
        engine.runRenderLoop( function () {
            scene.render();
        } );
    };
    new BABYLON.AxesViewer( scene, 1.5 );

    global_scene.update( () => {
        return scene;
    } )
    document.onkeyup = function ( e ) {
        const evt = window.event || e;
        //console.log(evt.keyCode);
        // @ts-ignore
        if ( evt.keyCode == 73 && evt.ctrlKey && evt.altKey ) {
            if ( scene.debugLayer.isVisible() ) {
                scene.debugLayer.hide();
            } else {
                scene.debugLayer.show( {
                    globalRoot: document.body,
                } );
            }
        }
    };
    return scene;
}
