import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

import { EngineService } from './services/engine-service';
import { CameraService } from './services/camera-service';
import { LightService } from './services/light-service';
import { LoaderService } from './services/loader-service';
import { ShadowService } from "./services/shadow-service";
import { MaterialsService } from "./services/materials-service";
import { EnvironmentService } from "./services/environment-service";
import { SetupMeshesService } from "./services/setup-meshes-service";


export const createScene = async ( canvas ) => {

	const engine = new EngineService( canvas ).getEngine();
	const scene = new BABYLON.Scene( engine );

	const cameraService = new CameraService( canvas, scene );
	const lightService = new LightService( scene );
	const materialService = new MaterialsService( scene );
	const lights: Array<any> = lightService.createDirectionalLights();
	const shadowService = new ShadowService( lights )
	const loaderService = new LoaderService(scene);
	const envService = new EnvironmentService( scene, materialService, loaderService );

	scene.clearColor = new BABYLON.Color4( 1.0, 1.0, 1.0, 1.0 ).toLinearSpace();
	cameraService.createPerspectiveCam();

	loaderService.assetsManager.onProgress = function ( remainingCount, totalCount, lastFinishedTask ) {
		engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
	};
	loaderService.loadAll();

	materialService.createGridMaterial();
	materialService.createShadowOnlyMaterial();
	envService.createHDREnvironment()
	envService.createGround();
	envService.createGrid();

	let debugOn = false;
	canvas.onkeydown = keydown;

	function keydown( evt ) {
		if (!evt) evt = event;
		if (evt.ctrlKey && evt.altKey && evt.keyCode === 68) {
			debugOn = !debugOn
			if (debugOn) {
				scene.debugLayer.show();
			} else {
				scene.debugLayer.hide();
			}
		}
	}
	loaderService.assetsManager.onFinish = () => {
		engine.runRenderLoop( function () {
			scene.render();
		} );
	};

	return scene;
}
