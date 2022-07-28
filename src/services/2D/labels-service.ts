import * as BABYLON from "babylonjs";

export class LabelsService {
    private readonly scene: BABYLON.Scene;
    private mesh;
    private actionManager: BABYLON.ActionManager;

    constructor( scene ) {
        this.scene = scene;
        this.mesh = '';
        this.actionManager = new BABYLON.ActionManager( this.scene );
    }

    createLabel( text, position ) {
        let size_new;
        let textureResolution = 512;
        let textureGround = new BABYLON.DynamicTexture( "dynamic texture", {
            width: 512,
            height: 256
        }, this.scene, false, null );
        let textureContext = textureGround.getContext();
//Add text to dynamic texture
        let font = "bold 100px sans-serif";
        textureGround.drawText( text, 50, 128, font, "black", "white", true, true );
        let label = BABYLON.MeshBuilder.CreatePlane( "plane", { height: 1, width: 2 }, this.scene );
        let infoMaterial = new BABYLON.StandardMaterial( "infoMat", this.scene );
        infoMaterial.useAlphaFromDiffuseTexture = true;
        infoMaterial.diffuseTexture = textureGround;
        label.material = infoMaterial;
        this.mesh = label;
        label.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
        label.position.x = position.x;
        label.position.y = 1;
        label.position.z = position.y;
        label.rotation.x = Math.PI / 2;

        this.scene.onPointerObservable.add( ( e ) => {
            if ( e.type === BABYLON.PointerEventTypes.POINTERDOWN ) {

            }
        } )
    }
}