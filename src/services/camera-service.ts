import * as BABYLON from 'babylonjs';
import { DeviceIdentifierHelper } from "./device-identifier-helper";

export class CameraService {
	private readonly canvas: any;
	private readonly scene: any;

	constructor( canvas, scene ) {
		this.canvas = canvas;
		this.scene = scene;
	}

	createPerspectiveCam() {
		let isDeviceMobile = new DeviceIdentifierHelper().isMobile();

		const camera = new BABYLON.ArcRotateCamera( "camera",
			-Math.PI / 1.8,
			Math.PI / 2.5,
			6,
			new BABYLON.Vector3( 0, 0, 0 ),
			this.scene );
		camera.attachControl( this.canvas, true );
		camera.minZ = 0.1;
		camera.target = new BABYLON.Vector3( 0, 0.8, 0 );
		camera.upperBetaLimit = Math.PI / 2.2;
		camera.lowerRadiusLimit = 5;
		camera.upperRadiusLimit = 8;

		if (isDeviceMobile) {
			camera.radius = 10;
			camera.upperRadiusLimit = 12;
			camera.pinchPrecision = 850;
		}

		return camera
	}
}
