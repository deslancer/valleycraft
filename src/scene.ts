import * as BABYLON from 'babylonjs';
import { EngineService } from './services/engine-service';
import { CameraService } from './services/camera-service';
import { LightService } from './services/light-service';
import { LoaderService } from './services/loader-service';
import { ShadowService } from "./services/shadow-service";
import { MaterialsService } from "./services/materials-service";
import { EnvironmentService } from "./services/environment-service";
import { WallsGenerator } from "./services/building-generator/walls-generator";
import { CornerGenerator } from "./services/building-generator/corner-generator";
import { BuilderService } from "./services/building-generator/builder-service";



export const createScene = async ( canvas ) => {

	const engine = new EngineService( canvas ).getEngine();
	const scene = new BABYLON.Scene( engine );

	const cameraService = new CameraService( canvas, scene );
	const lightService = new LightService( scene );
	const materialService = new MaterialsService( scene );
	lightService.createHemisphericLight();
	const loaderService = new LoaderService(scene);
	const envService = new EnvironmentService( scene, materialService, loaderService );
	scene.clearColor = new BABYLON.Color4( 1.0, 1.0, 1.0, 1.0 ).toLinearSpace();
	cameraService.createPerspectiveCam();


	loaderService.loadAll();
	materialService.createGridMaterial();
	materialService.createShadowOnlyMaterial();
	envService.createHDREnvironment()
	envService.createGround();
	envService.createGrid();
/////////////////////////////////////////////////////////////////////
	const baseData = [-3, -2, -1, -4, 1,-4, 3, -2, 5, -2, 5, 1, 2, 1, 2, 3, -3, 3];
	const cornerGenerator = new CornerGenerator(baseData)
	const wallGenerator = new WallsGenerator(cornerGenerator.getCorners());

	const ply = 0.3;
	const  height = 3;



	const builderService = new BuilderService();

	const mesh = builderService.buildFromPlan(wallGenerator.getWalls(), ply, height, {interiorUV: new BABYLON.Vector4(0.167, 0, 1, 1), exteriorUV: new BABYLON.Vector4(0, 0, 0.16, 1)}, scene);

	const material = new BABYLON.StandardMaterial("", scene);
	material.diffuseTexture = new BABYLON.Texture("http://i.imgur.com/88fOIk3.jpg", scene);
	mesh.material = material;

	loaderService.assetsManager.onFinish = () => {
		engine.runRenderLoop( function () {
			scene.render();
		} );
	};
	//scene.debugLayer.show()
	return scene;
}
