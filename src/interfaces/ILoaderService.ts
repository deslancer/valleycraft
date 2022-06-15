import * as BABYLON from 'babylonjs'
export interface ILoaderService {
	addEnvTextureTask(): void;
	getEnvTextureTask(): object;
	loadAll(): void;
}
