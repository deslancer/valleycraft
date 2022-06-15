export interface IMaterialService {
	createGridMaterial(): void;
	createShadowOnlyMaterial(): void;
	gridMaterial(): object;
	shadowOnlyMaterial(): object;
}
