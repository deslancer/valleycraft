import * as BABYLON from 'babylonjs'
export interface ILoaderService {
	addShelterTask(): void;

	addBagsTask(): void;

	addStandDummyTask(): void;

	addSittingDummyTask(): void;

	addEnvTextureTask(): void;

	getShelterTask(): object;

	getBagsTask(): object;

	getStandDummyTask(): object;

	getSittingDummyTask(): object;

	getEnvTextureTask(): object;

	loadAll(): void;
}
