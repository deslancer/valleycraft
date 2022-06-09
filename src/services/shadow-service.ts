import * as BABYLON from 'babylonjs';
import { IShadowGenerator } from '../interfaces/IShadowGenerator';

export class ShadowService implements IShadowGenerator {
	private shadowGenerator: any;
	private readonly lights: Array<any>;

	constructor( lights: Array<any> ) {
		this.lights = lights
	}

	createGenerator(): void {
		const shadowGenerator = new BABYLON.ShadowGenerator( 512, this.lights[0] )
		shadowGenerator.useBlurExponentialShadowMap = true;
		shadowGenerator.blurScale = 2;
		shadowGenerator.setDarkness( 0.4 );
		this.shadowGenerator = shadowGenerator;
	}

	getGenerator(): object {
		return this.shadowGenerator
	}
}
