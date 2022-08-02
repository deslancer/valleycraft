import * as BABYLON from 'babylonjs';
import earcut from "earcut";

export class PolygonCreatorService {
    private polygon: BABYLON.Mesh;
    private readonly scene: BABYLON.Scene;

    constructor( scene ) {
        this.scene = scene;
    }

    createPolygon( vectors: Array<BABYLON.Vector3> ) {
        const line = this.createLine2D( "line", { path: vectors, width: 0.2, closed: true }, this.scene );
        line.material = new BABYLON.StandardMaterial( "line_material", this.scene );
        // @ts-ignore
        line.material.diffuseColor = BABYLON.Color3.Black();
        line.position = new BABYLON.Vector3( 0, 0.1, 0 );

        this.polygon = BABYLON.MeshBuilder.CreatePolygon( "polygon",
            { shape: vectors, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, this.scene, earcut );
        this.polygon.material = new BABYLON.StandardMaterial( "polygon", this.scene );
        // @ts-ignore
        this.polygon.material.diffuseColor = new BABYLON.Color3( 0.51, 0.67, 0.95 );
        this.polygon.position = new BABYLON.Vector3( 0, 0, 0 );
    }

    createLine2D( name, options, scene ) {
        //Arrays for vertex positions and indices
        const positions = [];
        const indices = [];
        const normals = [];

        const width = options.width || 1;
        const path = options.path;
        const closed = options.closed || false;
        let standardUV;
        if ( options.standardUV === undefined ) {
            standardUV = true;
        } else {
            standardUV = options.standardUV;
        }

        let interiorIndex;

        //Arrays to hold wall corner data
        const innerBaseCorners = [];
        const outerBaseCorners = [];

        const outerData = [];
        const innerData = [];
        let angle = 0;

        const nbPoints = path.length;
        let line = BABYLON.Vector3.Zero();
        let lineNormal;
        let direction;
        const nextLine = BABYLON.Vector3.Zero();
        path[ 1 ].subtractToRef( path[ 0 ], line );

        if ( nbPoints > 2 && closed ) {
            path[ 2 ].subtractToRef( path[ 1 ], nextLine );
            for ( let p = 0; p < nbPoints; p++ ) {
                angle = Math.PI - Math.acos( BABYLON.Vector3.Dot( line, nextLine ) / ( line.length() * nextLine.length() ) );
                let direction = BABYLON.Vector3.Cross( line, nextLine ).normalize().y;
                lineNormal = new BABYLON.Vector3( -line.z, 0, 1 * line.x ).normalize();
                line.normalize();
                innerData[ ( p + 1 ) % nbPoints ] = path[ ( p + 1 ) % nbPoints ];
                outerData[ ( p + 1 ) % nbPoints ] = path[ ( p + 1 ) % nbPoints ].add( lineNormal.scale( width ) ).add( line.scale( direction * width / Math.tan( angle / 2 ) ) );
                line = nextLine.clone();
                path[ ( p + 3 ) % nbPoints ].subtractToRef( path[ ( p + 2 ) % nbPoints ], nextLine );
            }
        } else {
            lineNormal = new BABYLON.Vector3( -line.z, 0, 1 * line.x ).normalize();
            line.normalize();
            innerData[ 0 ] = path[ 0 ];
            outerData[ 0 ] = path[ 0 ].add( lineNormal.scale( width ) );

            for ( let p = 0; p < nbPoints - 2; p++ ) {
                path[ p + 2 ].subtractToRef( path[ p + 1 ], nextLine );
                angle = Math.PI - Math.acos( BABYLON.Vector3.Dot( line, nextLine ) / ( line.length() * nextLine.length() ) );
                direction = BABYLON.Vector3.Cross( line, nextLine ).normalize().y;
                lineNormal = new BABYLON.Vector3( -line.z, 0, 1 * line.x ).normalize();
                line.normalize();
                innerData[ p + 1 ] = path[ p + 1 ];
                outerData[ p + 1 ] = path[ p + 1 ].add( lineNormal.scale( width ) ).add( line.scale( direction * width / Math.tan( angle / 2 ) ) );
                line = nextLine.clone();
            }
            if ( nbPoints > 2 ) {
                path[ nbPoints - 1 ].subtractToRef( path[ nbPoints - 2 ], line );
                lineNormal = new BABYLON.Vector3( -line.z, 0, 1 * line.x ).normalize();
                line.normalize();
                innerData[ nbPoints - 1 ] = path[ nbPoints - 1 ];
                outerData[ nbPoints - 1 ] = path[ nbPoints - 1 ].add( lineNormal.scale( width ) );
            } else {
                innerData[ 1 ] = path[ 1 ]
                outerData[ 1 ] = path[ 1 ].add( lineNormal.scale( width ) );
            }
        }

        var maxX = Number.MIN_VALUE;
        var minX = Number.MAX_VALUE;
        var maxZ = Number.MIN_VALUE;
        var minZ = Number.MAX_VALUE;

        for ( let p = 0; p < nbPoints; p++ ) {
            positions.push( innerData[ p ].x, innerData[ p ].y, innerData[ p ].z );
            maxX = Math.max( innerData[ p ].x, maxX );
            minX = Math.min( innerData[ p ].x, minX );
            maxZ = Math.max( innerData[ p ].z, maxZ );
            minZ = Math.min( innerData[ p ].z, minZ );
        }

        for ( let p = 0; p < nbPoints; p++ ) {
            positions.push( outerData[ p ].x, outerData[ p ].y, outerData[ p ].z );
            maxX = Math.max( innerData[ p ].x, maxX );
            minX = Math.min( innerData[ p ].x, minX );
            maxZ = Math.max( innerData[ p ].z, maxZ );
            minZ = Math.min( innerData[ p ].z, minZ );
        }

        for ( let i = 0; i < nbPoints - 1; i++ ) {
            indices.push( i, i + 1, nbPoints + i + 1 );
            indices.push( i, nbPoints + i + 1, nbPoints + i )
        }

        if ( nbPoints > 2 && closed ) {
            indices.push( nbPoints - 1, 0, nbPoints );
            indices.push( nbPoints - 1, nbPoints, 2 * nbPoints - 1 )
        }

        const uvs = [];

        if ( standardUV ) {
            for ( var p = 0; p < positions.length; p += 3 ) {
                uvs.push( ( positions[ p ] - minX ) / ( maxX - minX ), ( positions[ p + 2 ] - minZ ) / ( maxZ - minZ ) );
            }
        } else {
            let flip = 0;
            let p1 = 0;
            let p2 = 0;
            let p3 = 0;
            let v0 = innerData[ 0 ];
            let v1 = innerData[ 1 ].subtract( v0 );
            let v2 = outerData[ 0 ].subtract( v0 );
            let v3 = outerData[ 1 ].subtract( v0 );
            let axis = v1.clone();
            axis.normalize();

            p1 = BABYLON.Vector3.Dot( axis, v1 );
            p2 = BABYLON.Vector3.Dot( axis, v2 );
            p3 = BABYLON.Vector3.Dot( axis, v3 );
            minX = Math.min( 0, p1, p2, p3 );
            maxX = Math.max( 0, p1, p2, p3 );

            uvs[ 2 * indices[ 0 ] ] = -minX / ( maxX - minX );
            uvs[ 2 * indices[ 0 ] + 1 ] = 1;
            uvs[ 2 * indices[ 5 ] ] = ( p2 - minX ) / ( maxX - minX );
            uvs[ 2 * indices[ 5 ] + 1 ] = 0;

            uvs[ 2 * indices[ 1 ] ] = ( p1 - minX ) / ( maxX - minX );
            uvs[ 2 * indices[ 1 ] + 1 ] = 1;
            uvs[ 2 * indices[ 4 ] ] = ( p3 - minX ) / ( maxX - minX );
            uvs[ 2 * indices[ 4 ] + 1 ] = 0;

            for ( let i = 6; i < indices.length; i += 6 ) {

                flip = ( flip + 1 ) % 2;
                v0 = innerData[ 0 ];
                v1 = innerData[ 1 ].subtract( v0 );
                v2 = outerData[ 0 ].subtract( v0 );
                v3 = outerData[ 1 ].subtract( v0 );
                axis = v1.clone();
                axis.normalize();

                p1 = BABYLON.Vector3.Dot( axis, v1 );
                p2 = BABYLON.Vector3.Dot( axis, v2 );
                p3 = BABYLON.Vector3.Dot( axis, v3 );
                minX = Math.min( 0, p1, p2, p3 );
                maxX = Math.max( 0, p1, p2, p3 );

                uvs[ 2 * indices[ i + 1 ] ] = flip + Math.cos( flip * Math.PI ) * ( p1 - minX ) / ( maxX - minX );
                uvs[ 2 * indices[ i + 1 ] + 1 ] = 1;
                uvs[ 2 * indices[ i + 4 ] ] = flip + Math.cos( flip * Math.PI ) * ( p3 - minX ) / ( maxX - minX );
                uvs[ 2 * indices[ i + 4 ] + 1 ] = 0;
            }
        }

        BABYLON.VertexData.ComputeNormals( positions, indices, normals );
        BABYLON.VertexData._ComputeSides( BABYLON.Mesh.DOUBLESIDE, positions, indices, normals, uvs );
        console.log( uvs )
        //Create a custom mesh
        const customMesh = new BABYLON.Mesh( "line2D", scene );

        //Create a vertexData object
        const vertexData = new BABYLON.VertexData();

        //Assign positions and indices to vertexData
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        //Apply vertexData to custom mesh
        vertexData.applyToMesh( customMesh );

        return customMesh;

    }

    getPolygon() {
        return this.polygon;
    }
}