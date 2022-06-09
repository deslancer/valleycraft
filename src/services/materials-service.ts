import * as BABYLON from 'babylonjs';
import * as Materials from 'babylonjs-materials';
import { IMaterialService } from '../interfaces/IMaterialService';

export class MaterialsService implements IMaterialService{
	private readonly scene: any;
	private gridMat: any;
	private grassMat: any;
	private shadowOnlyMat: any;
	private backgroundMat: any;

	constructor( scene ) {
		this.scene = scene;
	}

	createGrassMaterial() {
		let grass_mat = new BABYLON.PBRMaterial( "pbr", this.scene );
		grass_mat.albedoTexture = new BABYLON.Texture( 'assets/textures/GF_04_1K_Diffuse.png', this.scene );
		grass_mat.bumpTexture = new BABYLON.Texture( 'assets/textures/GF_04_1K_NH.png', this.scene );
		grass_mat.metallicTexture = new BABYLON.Texture( 'assets/textures/GF_04_1K_ORM.png', this.scene );
		grass_mat.useRoughnessFromMetallicTextureAlpha = false;
		grass_mat.useRoughnessFromMetallicTextureGreen = true;
		grass_mat.useMetallnessFromMetallicTextureBlue = true;
		//grass_mat.environmentTexture = hdrTexture;
		grass_mat.albedoTexture.uScale = 5.0;
		grass_mat.albedoTexture.vScale = 5.0;
		grass_mat.bumpTexture.uScale = 5.0;
		grass_mat.bumpTexture.vScale = 5.0;
		this.grassMat = grass_mat;
	}

	createGridMaterial() {
		let grid_material = new Materials.GridMaterial( "gridMaterial", this.scene );
		grid_material.opacity = 0.99;
		grid_material.mainColor = new BABYLON.Color3( 0.62, 0.62, 0.62 );
		grid_material.lineColor = new BABYLON.Color3( 0.72, 0.72, 0.72 );
		grid_material.gridOffset = new BABYLON.Vector3( 0.5, 0, 0 );
		grid_material.gridRatio = 0.25;
		grid_material.majorUnitFrequency = 5;
		this.gridMat = grid_material;
	}

	createBackgroundMaterial() {
		let backgroundMaterial = new BABYLON.BackgroundMaterial( "backgroundMaterial", this.scene );
		backgroundMaterial.reflectionTexture = new BABYLON.CubeTexture( "assets/textures/TropicalSunnyDay", this.scene );
		backgroundMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		this.backgroundMat = backgroundMaterial;
	}

	createShadowOnlyMaterial() {
		this.shadowOnlyMat = new Materials.ShadowOnlyMaterial( 'shadowOnly', this.scene );
	}

	setupExistsMaterials() {
		let dimension_height_mat = this.scene.getMaterialByName( 'dimensions_h' );
		let dimension_wd_mat = this.scene.getMaterialByName( 'dimensions_wd' );
		let shelter_room = this.scene.getMaterialByName( 'Room' );
		shelter_room.albedoTexture = new BABYLON.Texture( 'assets/textures/Room_BaseColor_light_10.jpg', this.scene );

		dimension_wd_mat.hasAlpha = true;
		dimension_wd_mat.metallic = 1.0;
		dimension_wd_mat.transparencyMode = 3;
		dimension_wd_mat.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
		dimension_height_mat.hasAlpha = true;
		dimension_height_mat.transparencyMode = 3;
		dimension_height_mat.alphaMode = BABYLON.Engine.ALPHA_COMBINE;

	}

	get gridMaterial() {
		return this.gridMat;
	}

	get grassMaterial() {
		return this.grassMat;
	}

	get backgroundMaterial() {
		return this.backgroundMat;
	}

	get shadowOnlyMaterial() {
		return this.shadowOnlyMat;
	}
}
