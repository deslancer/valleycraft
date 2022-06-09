export interface IMaterialService {
	createGrassMaterial(): void;
	createGridMaterial(): void;
	createBackgroundMaterial(): void;
	createShadowOnlyMaterial(): void;
	setupExistsMaterials(): void;
	gridMaterial(): object;
	grassMaterial(): object;
	backgroundMaterial(): object;
	shadowOnlyMaterial(): object;
}
