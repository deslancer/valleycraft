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
import { EventsService } from "./services/events-service";
import earcut from "earcut";
import { coordinatesArr, global_scene } from './store';

export const createScene = async ( canvas ) => {

	const engine = new EngineService( canvas ).getEngine();
	const scene = new BABYLON.Scene( engine );

	const cameraService = new CameraService( canvas, scene );
	const lightService = new LightService( scene );
	const materialService = new MaterialsService( scene );
	lightService.createHemisphericLight();
	const loaderService = new LoaderService(scene);
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

	const eventService = new EventsService(scene);

	const baseData = [-3, -2, -1, -4, 1,-4, 3, -2, 5, -2, 5, 1, 2, 1, 2, 3, -3, 3];

	const cornerGenerator = new CornerGenerator(baseData)
	const wallGenerator = new WallsGenerator(cornerGenerator.getCorners());

	const ply = 0.3;
	const  height = 3;

	scene.setActiveCameraByName('ortho')
	/*let polygon = BABYLON.MeshBuilder.CreatePolygon("polygon",
		{shape:cornerGenerator.getCorners(true),  sideOrientation: BABYLON.Mesh.DOUBLESIDE },scene, earcut);*/
	//let line = BABYLON.Mesh.CreateLines("lines", cornerGenerator.getCorners(true), scene, true);

///////////////////////////////////////////////////////





	const builderService = new BuilderService();

	/*const mesh = builderService.buildFromPlan(wallGenerator.getWalls(), ply, height, {interiorUV: new BABYLON.Vector4(0.167, 0, 1, 1), exteriorUV: new BABYLON.Vector4(0, 0, 0.16, 1)}, scene);

	const material = new BABYLON.StandardMaterial("", scene);
	material.diffuseTexture = new BABYLON.Texture("http://i.imgur.com/88fOIk3.jpg", scene);
	mesh.material = material;*/
	/*cornerGenerator.getCorners().forEach((value)=>{
		const pointerDragBehavior = new BABYLON.PointerDragBehavior({dragPlaneNormal: new BABYLON.Vector3(0,1,0)});
		pointerDragBehavior.useObjectOrientationForDragging = false;

		let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.3});
		sphere.position = value;
		sphere.addBehavior(pointerDragBehavior);
		pointerDragBehavior.onDragObservable.add((event)=>{
			//console.log(event);
		})
	})*/
	loaderService.assetsManager.onFinish = () => {
		engine.runRenderLoop( function () {
			scene.render();
		} );
	};
	new BABYLON.AxesViewer(scene, 1.5);

	global_scene.update(()=>{
		return scene;
	})
	return scene;
}
