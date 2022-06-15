import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import type { ILoaderService } from "../interfaces/ILoaderService";

export class LoaderService implements ILoaderService {
	private url: string = './assets/models/';
	assetsManager;
	private envTextureTask;

	constructor( scene ) {
		this.assetsManager = new BABYLON.AssetsManager( scene );
	}

	addEnvTextureTask() {
		this.envTextureTask = this.assetsManager.addCubeTextureTask( 'cube texture', "./assets/textures/environment.env", null, false, null, true )
	}
	getEnvTextureTask() {
		return this.envTextureTask
	}

	loadAll() {
		this.addEnvTextureTask()
		this.assetsManager.load();
	}
}
