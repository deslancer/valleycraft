import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import { ILoaderService } from "../interfaces/ILoaderService";

export class LoaderService implements ILoaderService {
	private url: string = './assets/models/';
	assetsManager;
	private shelterTask;
	private bagsTask;
	private standDummyTask;
	private sittingDummyTask;
	private envTextureTask;

	constructor( scene ) {
		this.assetsManager = new BABYLON.AssetsManager( scene );
	}

	addShelterTask() {
		this.shelterTask = this.assetsManager.addMeshTask( "shelter task", "", this.url, "shelter_lp3.glb" );
	}

	addBagsTask() {
		this.bagsTask = this.assetsManager.addMeshTask( "bags task", "", this.url, "sleepingbags2.glb" );
	}

	addStandDummyTask() {
		this.standDummyTask = this.assetsManager.addMeshTask( "standing  task", "", this.url, "offensive_idle.glb" );
	}

	addSittingDummyTask() {
		this.sittingDummyTask = this.assetsManager.addMeshTask( "sitting  task", "", this.url, "sitting_idle.glb" );
	}

	addEnvTextureTask() {
		this.envTextureTask = this.assetsManager.addCubeTextureTask( 'cube texture', "./assets/textures/environment.env", null, false, null, true )
	}

	getShelterTask() {
		return this.shelterTask
	}

	getBagsTask() {
		return this.bagsTask
	}

	getStandDummyTask() {
		return this.standDummyTask
	}

	getSittingDummyTask() {
		return this.sittingDummyTask
	}

	getEnvTextureTask() {
		return this.envTextureTask
	}

	loadAll() {
		this.addShelterTask();
		this.addBagsTask()
		this.addSittingDummyTask()
		this.addStandDummyTask()
		this.addEnvTextureTask()
		this.assetsManager.load();
	}

	/*loadModel( scene ) {
		let meshes;
		const url = "./assets/models/shelter_lp3.glb";
		return new Promise( ( resolve, reject ) => {
			const fileStatus = linkCheck( url );
			if (fileStatus) {
				BABYLON.SceneLoader.ImportMeshAsync( "", "/assets/models/", 'shelter_lp3.glb', scene ).then( ( result ) => {

					const dimension_height = scene.getMeshByName( 'dimension_h' );
					const dimension_wd = scene.getMeshByName( 'dimensions_plane' );
					//dimension_height.isVisible = false;
					//dimension_wd.isVisible = false;
					dimension_height.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
					dimension_height.position.z = -1;
					dimension_height.position.y = -0.7;
					dimension_height.rotationQuaternion = new BABYLON.Quaternion.RotationAxis( new BABYLON.Vector3( 0, 1, -1 ), Math.PI );
					resolve( meshes )
					reject( new Error( "Requested file return status 404" ) );
				} );
			}
		} )

	}
	loadBags( scene){
		const url = "./assets/models/sleepingbags2.glb";
		return new Promise( ( resolve, reject ) => {
			const fileStatus = linkCheck( url );
			if (fileStatus) {
				BABYLON.SceneLoader.ImportMeshAsync( "", "/assets/models/", 'sleepingbags2.glb', scene ).then( ( result ) => {
					let meshes = result.meshes[0];
					meshes.getChildMeshes().forEach(mesh => {
						mesh.isVisible = false;
					})
					resolve( meshes )
					reject( new Error( "Requested file return status 404" ) );
				} );
			}
		} )
	}
	loadDummies( scene){
		const url = "./assets/models/sleepingbags2.glb";
		return new Promise( ( resolve, reject ) => {
			const fileStatus = linkCheck( url );
			if (fileStatus) {
				BABYLON.SceneLoader.ImportMeshAsync( "", "/assets/models/", 'sleepingbags2.glb', scene ).then( ( result ) => {
					let meshes = result.meshes[0];
					meshes.getChildMeshes().forEach(mesh => {
						mesh.isVisible = false;
					})
					resolve( meshes )
					reject( new Error( "Requested file return status 404" ) );
				} );
			}
		} )
	}*/
}
