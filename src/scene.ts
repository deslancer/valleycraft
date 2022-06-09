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
import { global_scene, preloading } from './services/store';

export const createScene = async ( canvas ) => {

	const engine = new EngineService( canvas ).getEngine();
	const scene = new BABYLON.Scene( engine );

	const cameraService = new CameraService( canvas, scene );
	const lightService = new LightService( scene );
	const materialService = new MaterialsService( scene );
	const lights: Array<any> = lightService.createDirectionalLights();
	const shadowService = new ShadowService( lights )
	const loaderService = new LoaderService(scene);
	const setupMeshes = new SetupMeshesService(shadowService , loaderService, materialService );
	const envService = new EnvironmentService( scene, materialService, loaderService );

	scene.clearColor = new BABYLON.Color4( 1.0, 1.0, 1.0, 1.0 ).toLinearSpace();
	cameraService.createPerspectiveCam();


	preloading.update( () => {
		return true;
	} );

	/*loaderService.loadModel( scene ).then( () => {
		envService.createHDREnvironment().then( () => {
			materialService.createBackgroundMaterial();
			materialService.createGrassMaterial();
			materialService.createGridMaterial();
			materialService.createShadowOnlyMaterial();
			materialService.setupExistsMaterials();

			envService.createSkyBox();
			envService.createGround();
			envService.createGrid();

			loaderService.loadBags(scene);
		} )
	} ).catch(error => {
		console.log(error)
	})*/


	preloading.update( () => {
		return false;
	} );

	loaderService.assetsManager.onProgress = function ( remainingCount, totalCount, lastFinishedTask ) {
		engine.loadingUIText = 'We are loading the scene. ' + remainingCount + ' out of ' + totalCount + ' items still need to be loaded.';
	};
	loaderService.loadAll();
	setupMeshes.setupShelterMesh(scene);
	setupMeshes.setupDummies();
	setupMeshes.setupBags();
	materialService.createBackgroundMaterial();
	materialService.createGrassMaterial();
	materialService.createGridMaterial();
	materialService.createShadowOnlyMaterial();
	envService.createHDREnvironment()
	envService.createSkyBox();
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
	global_scene.update( () => {
		return scene;
	} );
	return scene;
}
