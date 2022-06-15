import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';
import type { IShadowGenerator } from "../interfaces/IShadowGenerator";
import type { ILoaderService } from "../interfaces/ILoaderService"
import type { IMaterialService } from "../interfaces/IMaterialService";
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

		}
		this.loaderService.getShelterTask().onError = (task, message, exception) => {
			console.log(message, exception);
		}
	}

}
