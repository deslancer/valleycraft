import { BuilderService } from "../building-generator/builder-service";
import { WallsGenerator } from '../building-generator/walls-generator'
import { CornerGenerator } from "../building-generator/corner-generator";
import { coordinatesArr } from '../../store';

export class BuildingCreatorService {
    ply: number = 0.3;
    height: number = 3;

    build( scene ) {

        const builderService = new BuilderService();
        let baseData;
        coordinatesArr.subscribe( ( result ) => {
            baseData = this.fromVector3ToPlainArr( result );
            const cornerGenerator = new CornerGenerator( baseData )
            const wallGenerator = new WallsGenerator( cornerGenerator.getCorners() );
            const mesh = builderService.buildFromPlan( wallGenerator.getWalls(), this.ply, this.height, {
                interiorUV: new BABYLON.Vector4( 0.167, 0, 1, 1 ),
                exteriorUV: new BABYLON.Vector4( 0, 0, 0.16, 1 )
            }, scene );

            const material = new BABYLON.StandardMaterial( "", scene );
            material.diffuseTexture = new BABYLON.Texture( "http://i.imgur.com/88fOIk3.jpg", scene );
            // @ts-ignore
            mesh.material = material;
        } )


    }

    private fromVector3ToPlainArr( arr: Array<BABYLON.Vector3> ): Array<number> {
        const modifiedArr = [];
        arr.forEach( ( vec ) => {
            modifiedArr.push( vec.x );
            modifiedArr.push( vec.z );
        } )
        console.log( modifiedArr )
        return modifiedArr
    }
}