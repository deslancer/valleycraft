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

		const camera = new BABYLON.ArcRotateCamera( "perspective",
			-Math.PI / 1.8,
			Math.PI / 2.5,
			6,
			new BABYLON.Vector3( 0, 0, 0 ),
			this.scene );
		camera.attachControl( this.canvas, true );
		camera.minZ = 0.1;
		camera.target = new BABYLON.Vector3( 0, 0.8, 0 );
		camera.upperBetaLimit = Math.PI / 2.2;
		camera.lowerRadiusLimit = 25;
		camera.upperRadiusLimit = 80;

		if (isDeviceMobile) {
			camera.radius = 10;
			camera.upperRadiusLimit = 12;
			camera.pinchPrecision = 850;
		}

		return camera
	}
	createOrthoCamera(){
		// Set Camera
		const setTopBottomRatio = (camera) => {
			const ratio = this.canvas.height / this.canvas.width;
			camera.orthoTop = camera.orthoRight * ratio;
			camera.orthoBottom = camera.orthoLeft * ratio;
		};
		let zoomTarget = null;
		let totalZoom = 0;
		const zoom2DView = async (camera, delta) => {
			const zoomingOut = delta < 0;

			if (zoomTarget) {
				const totalX = Math.abs(camera.orthoLeft - camera.orthoRight);
				const totalY = Math.abs(camera.orthoTop - camera.orthoBottom);

				const aspectRatio = totalY / totalX;

				{
					const fromCoord = camera.orthoLeft - zoomTarget.x;
					const ratio = fromCoord / totalX;
					camera.orthoLeft -= ratio * delta;
				}

				{
					const fromCoord = camera.orthoRight - zoomTarget.x;
					const ratio = fromCoord / totalX;
					camera.orthoRight -= ratio * delta;
				}

				{
					const fromCoord = camera.orthoTop - zoomTarget.y;
					const ratio = fromCoord / totalY;
					camera.orthoTop -= ratio * delta * aspectRatio;
				}

				{
					const fromCoord = camera.orthoBottom - zoomTarget.y;
					const ratio = fromCoord / totalY;
					camera.orthoBottom -= ratio * delta * aspectRatio;
				}

				// decrease pan sensitivity the closer the zoom level.
				camera.panningSensibility = 6250 / Math.abs(totalX / 2);
			}
		};
		const resetCameraZoom = (camera) => {
			camera.setPosition(new BABYLON.Vector3(0, 0, -100));
			camera.target = new BABYLON.Vector3(0, 0, 0);
			camera.orthoLeft = -8;
			camera.orthoRight = 8;

			setTopBottomRatio(camera);
		};
		const ortho_camera = new BABYLON.ArcRotateCamera('ortho', 0, 0, 50, new BABYLON.Vector3(0, 50, 0), this.scene);

		ortho_camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
		resetCameraZoom(ortho_camera);
		this.scene.onPointerObservable.add(({ event }) => {
			const delta = (Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail || event.deltaY)))) * 0.2;
			if (delta > 0 && totalZoom < 14 || delta < 0) {
				totalZoom += delta;
				zoom2DView(ortho_camera, delta);
			}
		}, BABYLON.PointerEventTypes.POINTERWHEEL);

		this.scene.onPointerObservable.add(() => {
			zoomTarget = BABYLON.Vector3.Unproject(
				new BABYLON.Vector3(this.scene.pointerX, this.scene.pointerY, 0),
				this.scene.getEngine().getRenderWidth(),
				this.scene.getEngine().getRenderHeight(),
				ortho_camera.getWorldMatrix(),
				ortho_camera.getViewMatrix(),
				ortho_camera.getProjectionMatrix()
			);
		}, BABYLON.PointerEventTypes.POINTERMOVE);

		// lock the camera's placement, zooming is done manually in orthographic mode.
		// Locking this fixes strange issues with Hemispheric Light
		ortho_camera.lowerRadiusLimit = ortho_camera.radius;
		ortho_camera.upperRadiusLimit = ortho_camera.radius;
		const distance = 30;
		const aspect = this.scene.getEngine().getRenderingCanvasClientRect().height / this.scene.getEngine().getRenderingCanvasClientRect().width;
		ortho_camera.beta = 0;
		ortho_camera.orthoLeft = -distance/2;
		ortho_camera.orthoRight = distance / 2;
		ortho_camera.orthoBottom = ortho_camera.orthoLeft * aspect;
		ortho_camera.orthoTop = ortho_camera.orthoRight * aspect;
		ortho_camera.attachControl(this.canvas, true, true);
		ortho_camera._panningMouseButton = 0;
		return ortho_camera;
	}
}
