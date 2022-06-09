import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { IShadowGenerator } from "../interfaces/IShadowGenerator";
import { ILoaderService } from "../interfaces/ILoaderService"
import { IMaterialService } from "../interfaces/IMaterialService";
export class SetupMeshesService {
	private shadowGenerator: IShadowGenerator;
	private loaderService: ILoaderService;
	private materialService: IMaterialService;
	constructor( shadowGenerator: IShadowGenerator,
	             loaderService: ILoaderService,
	             materialService: IMaterialService
	             ) {
		this.shadowGenerator = shadowGenerator;
		this.loaderService = loaderService;
		this.materialService = materialService;

		this.shadowGenerator.createGenerator();
	}

	setupShelterMesh(scene) {
		this.loaderService.getShelterTask().onSuccess = (task) => {
			let meshes = task.loadedMeshes[0];
			const shelterOuter = scene.getNodeByName( 'Palatka_low' ).getChildren()[0];
			this.shadowGenerator.getGenerator().addShadowCaster( shelterOuter );
			const dimension_height = scene.getMeshByName('dimension_h');
			const dimension_wd = scene.getMeshByName('dimensions_plane');
			const ghostObject = meshes.getChildren()[0].clone( "ghost" );
			ghostObject.setEnabled( false );
			ghostObject.getChildren().forEach( ( child ) => {
				child.visibility = 0.25;
			} )
			this.materialService.setupExistsMaterials();
			dimension_height.isVisible = false;
			dimension_wd.isVisible = false;
			dimension_height.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
			dimension_height.position.z = -1;
			dimension_height.position.y = -0.7;
			dimension_height.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, -1), Math.PI);
		}
		this.loaderService.getShelterTask().onError = (task, message, exception) => {
			console.log(message, exception);
		}
	}
	setupDummies() {
		const sitting = this.loaderService.getSittingDummyTask();
		const standing = this.loaderService.getStandDummyTask();
		sitting.onSuccess = (task) => {
			let sitting_mesh = task.loadedMeshes[0];
			sitting_mesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
			sitting_mesh.position.z = 0.75;
			sitting_mesh.setEnabled(false);
		}
		standing.onSuccess = (task) => {
			let standing_mesh = task.loadedMeshes[0];
			standing_mesh.setEnabled(false);
			standing_mesh.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.LOCAL);
			standing_mesh.position.x = - 1.75;
			standing_mesh.position.z = -0.5;
			this.shadowGenerator.getGenerator().addShadowCaster( standing_mesh );
		}
		sitting.onError = (task, message, exception) => {
			console.log(message, exception);
		}
		standing.onError = (task, message, exception) => {
			console.log(message, exception);
		}
	}
	setupBags(){
		const bagsTask = this.loaderService.getBagsTask();
		bagsTask.onSuccess = (task) => {
			let bags = task.loadedMeshes[0];
			bags.setEnabled(false);
		}
		bagsTask.onError = (task, message, exception) => {
			console.log(task, message, exception);
		}
	}
}
