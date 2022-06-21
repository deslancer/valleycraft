import * as BABYLON from 'babylonjs';
import earcut from "earcut";

export class BuilderService {
    private angle: number = 0;
    private direction: number = 0;
    private maxL: number = 0;
    private line: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private nextLine: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private uvs: Array<number> = [];
    private positions: Array<number> = [];
    private indices: Array<number> = [];
    private nbIndices;
    private lineNormal: BABYLON.Vector3 = new BABYLON.Vector3( this.line.z, 0, -1 * this.line.x ).normalize();
    private interiorIndex;

    //Arrays to hold wall corner data
    private innerBaseCorners: Array<BABYLON.Vector3> = [];
    private outerBaseCorners: Array<BABYLON.Vector3> = [];
    private innerTopCorners: Array<BABYLON.Vector3> = [];
    private outerTopCorners: Array<BABYLON.Vector3> = [];
    private innerDoorCorners: Array<any> = [];
    private outerDoorCorners: Array<any> = [];
    private innerWindowCorners: Array<any> = [];
    private outerWindowCorners: Array<any> = [];


    private polygonCorners;
    private polygonTriangulation;
    private wallData;
    private wallDirection: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private wallNormal: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private wallLength;
    private exteriorWallLength;
    private doorData;
    private windowData;
    private uvx;
    private uvy;
    private colors = [];
    private wallDiff;

    buildFromPlan( walls: Array<any>, ply: number, height: number, options: object, scene: BABYLON.Scene ): BABYLON.Mesh {
        // @ts-ignore
        const interiorUV = options.interiorUV || new BABYLON.Vector4( 0, 0, 1, 1 );
        // @ts-ignore
        const exteriorUV = options.exteriorUV || new BABYLON.Vector4( 0, 0, 1, 1 );
        // @ts-ignore
        const interiorColor = options.interiorColor || new BABYLON.Color4( 1, 1, 1, 1 );
        // @ts-ignore
        const exteriorColor = options.exteriorColor || new BABYLON.Color4( 1, 1, 1, 1 );
        // @ts-ignore
        let interior = options.interior || false;

        if ( !interior ) {
            console.log('is not interior')
            walls.push( walls[ 0 ] );
        }

        const nbWalls = walls.length;
        if ( nbWalls === 2 ) {
            console.log('walls count = 2')
            walls[ 1 ].corner.subtractToRef( walls[ 0 ].corner, this.line );
            this.lineNormal = new BABYLON.Vector3( this.line.z, 0, -1 * this.line.x ).normalize();
            this.line.normalize();
            this.innerBaseCorners[ 0 ] = walls[ 0 ].corner;
            this.outerBaseCorners[ 0 ] = walls[ 0 ].corner.add( this.lineNormal.scale( ply ) );
            this.innerBaseCorners[ 1 ] = walls[ 1 ].corner;
            this.outerBaseCorners[ 1 ] = walls[ 1 ].corner.add( this.lineNormal.scale( ply ) );
        } else if ( nbWalls > 2 ) {
            for ( let w = 0; w < nbWalls - 1; w++ ) {
                walls[ w + 1 ].corner.subtractToRef( walls[ w ].corner, this.nextLine );
                this.angle = Math.PI - Math.acos( BABYLON.Vector3.Dot( this.line, this.nextLine ) / ( this.line.length() * this.nextLine.length() ) );
                this.direction = BABYLON.Vector3.Cross( this.nextLine, this.line ).normalize().y;
                this.lineNormal = new BABYLON.Vector3( this.line.z, 0, -1 * this.line.x ).normalize();
                this.line.normalize();
                this.innerBaseCorners[ w ] = walls[ w ].corner
                this.outerBaseCorners[ w ] = walls[ w ].corner.add( this.lineNormal.scale( ply ) ).add( this.line.scale( this.direction * ply / Math.tan( this.angle / 2 ) ) );
                this.line = this.nextLine.clone();
            }
            if ( interior ) {
                this.lineNormal = new BABYLON.Vector3( this.line.z, 0, -1 * this.line.x ).normalize();
                this.line.normalize();
                this.innerBaseCorners[ nbWalls - 1 ] = walls[ nbWalls - 1 ].corner
                this.outerBaseCorners[ nbWalls - 1 ] = walls[ nbWalls - 1 ].corner.add( this.lineNormal.scale( ply ) );
                walls[ 1 ].corner.subtractToRef( walls[ 0 ].corner, this.line );
                this.lineNormal = new BABYLON.Vector3( this.line.z, 0, -1 * this.line.x ).normalize();
                this.line.normalize();
                this.innerBaseCorners[ 0 ] = walls[ 0 ].corner;
                this.outerBaseCorners[ 0 ] = walls[ 0 ].corner.add( this.lineNormal.scale( ply ) );
            } else {
                walls[ 1 ].corner.subtractToRef( walls[ 0 ].corner, this.nextLine );
                this.angle = Math.PI - Math.acos( BABYLON.Vector3.Dot( this.line, this.nextLine ) / ( this.line.length() * this.nextLine.length() ) );
                this.direction = BABYLON.Vector3.Cross( this.nextLine, this.line ).normalize().y;
                this.lineNormal = new BABYLON.Vector3( this.line.z, 0, -1 * this.line.x ).normalize();
                this.line.normalize();
                this.innerBaseCorners[ 0 ] = walls[ 0 ].corner
                this.outerBaseCorners[ 0 ] = walls[ 0 ].corner.add( this.lineNormal.scale( ply ) ).add( this.line.scale( this.direction * ply / Math.tan( this.angle / 2 ) ) );
                this.innerBaseCorners[ nbWalls - 1 ] = this.innerBaseCorners[ 0 ];
                this.outerBaseCorners[ nbWalls - 1 ] = this.outerBaseCorners[ 0 ]

            }
        }

        // inner and outer top corners
        for ( let w = 0; w < nbWalls; w++ ) {
            this.innerTopCorners.push( new BABYLON.Vector3( this.innerBaseCorners[ w ].x, height, this.innerBaseCorners[ w ].z ) );
            this.outerTopCorners.push( new BABYLON.Vector3( this.outerBaseCorners[ w ].x, height, this.outerBaseCorners[ w ].z ) );
        }

        for ( let w = 0; w < nbWalls - 1; w++ ) {
            this.maxL = Math.max( this.innerBaseCorners[ w + 1 ].subtract( this.innerBaseCorners[ w ] ).length(), this.maxL );
        }

        const maxH = height; // for when gables introduced

        /******House Mesh Construction********/

            // Wall Construction

        for ( let w = 0; w < nbWalls - 1; w++ ) {
            walls[ w + 1 ].corner.subtractToRef( walls[ w ].corner, this.wallDirection );
            this.wallLength = this.wallDirection.length();
            this.wallDirection.normalize();
            this.wallNormal.x = this.wallDirection.z;
            this.wallNormal.z = -1 * this.wallDirection.x;
            this.exteriorWallLength = this.outerBaseCorners[ w + 1 ].subtract( this.outerBaseCorners[ w ] ).length();
            this.wallDiff = this.exteriorWallLength - this.wallLength;


            //doors
            if ( walls[ w ].doorSpaces ) {
                walls[ w ].doorSpaces.sort( ( a, b ) => {
                    return a.left - b.left
                } );
            }
            const doors = walls[ w ].doorSpaces.length;

            //Construct INNER wall polygon starting from (0, 0) using wall length and height and door data
            this.polygonCorners = [];
            this.polygonCorners.push( new BABYLON.Vector2( 0, 0 ) );

            for ( var d = 0; d < doors; d++ ) {
                this.polygonCorners.push( new BABYLON.Vector2( walls[ w ].doorSpaces[ d ].left, 0 ) );
                this.polygonCorners.push( new BABYLON.Vector2( walls[ w ].doorSpaces[ d ].left, walls[ w ].doorSpaces[ d ].door.height ) );
                this.polygonCorners.push( new BABYLON.Vector2( walls[ w ].doorSpaces[ d ].left + walls[ w ].doorSpaces[ d ].door.width, walls[ w ].doorSpaces[ d ].door.height ) );
                this.polygonCorners.push( new BABYLON.Vector2( walls[ w ].doorSpaces[ d ].left + walls[ w ].doorSpaces[ d ].door.width, 0 ) );
            }

            this.polygonCorners.push( new BABYLON.Vector2( this.wallLength, 0 ) );
            this.polygonCorners.push( new BABYLON.Vector2( this.wallLength, height ) );
            this.polygonCorners.push( new BABYLON.Vector2( 0, height ) );

            //Construct triangulation of polygon using its corners
            this.polygonTriangulation = new BABYLON.PolygonMeshBuilder( "", this.polygonCorners, scene, earcut );

            //windows
            //Construct holes and add to polygon from window data
            const windows = walls[ w ].windowSpaces.length;
            const holes = [];
            for ( let ws = 0; ws < windows; ws++ ) {
                const holeData = [];
                holeData.push( new BABYLON.Vector2( walls[ w ].windowSpaces[ ws ].left, height - walls[ w ].windowSpaces[ ws ].top - walls[ w ].windowSpaces[ ws ].window.height ) );
                holeData.push( new BABYLON.Vector2( walls[ w ].windowSpaces[ ws ].left + walls[ w ].windowSpaces[ ws ].window.width, height - walls[ w ].windowSpaces[ ws ].top - walls[ w ].windowSpaces[ ws ].window.height ) );
                holeData.push( new BABYLON.Vector2( walls[ w ].windowSpaces[ ws ].left + walls[ w ].windowSpaces[ ws ].window.width, height - walls[ w ].windowSpaces[ ws ].top ) );
                holeData.push( new BABYLON.Vector2( walls[ w ].windowSpaces[ ws ].left, height - walls[ w ].windowSpaces[ ws ].top ) );
                holes.push( holeData );
            }

            for ( let h = 0; h < holes.length; h++ ) {
                this.polygonTriangulation.addHole( holes[ h ] );
            }
            // @ts-ignore
            BABYLON.PolygonMeshBuilder.prototype.wallBuilder = function ( w0, w1 ) {
                const positions = [];
                const direction = w1.corner.subtract( w0.corner ).normalize();
                let angle = Math.acos( direction.x );
                if ( direction.z != 0 ) {
                    angle *= direction.z / Math.abs( direction.z );
                }
                this._points.elements.forEach( function ( p ) {
                    positions.push( p.x * Math.cos( angle ) + w0.corner.x, p.y, p.x * Math.sin( angle ) + w0.corner.z );
                } );
                const indices = [];
                const res = earcut( this._epoints, this._eholes, 2 );
                for ( let i = res.length; i > 0; i-- ) {
                    indices.push( res[ i - 1 ] );
                }
                return { positions: positions, indices: indices };
            };

            // wallBuilder produces wall vertex positions array and indices using the current and next wall to rotate and translate vertex positions to correct place
            this.wallData = this.polygonTriangulation.wallBuilder( walls[ w ], walls[ w + 1 ] );
            this.nbIndices = this.positions.length / 3; // current number of indices
            this.polygonTriangulation._points.elements.forEach( ( p ) => {
                this.uvx = interiorUV.x + p.x * ( interiorUV.z - interiorUV.x ) / this.maxL;
                this.uvy = interiorUV.y + p.y * ( interiorUV.w - interiorUV.y ) / height;
                this.uvs.push( this.uvx, this.uvy );
                this.colors.push( interiorColor.r, interiorColor.g, interiorColor.b, interiorColor.a );
            } );

            //Add inner wall positions (repeated for flat shaded mesh)
            this.positions = this.positions.concat( this.wallData.positions );

            this.interiorIndex = this.positions.length / 3;

            this.indices = this.indices.concat( this.wallData.indices.map( ( idx ) => {
                return idx + this.nbIndices;
            } ) )

            //wallData has format for inner wall [base left, 0 or more doors, base right, top right, top left, windows]
            //extract door and wall data

            this.windowData = this.wallData.positions.slice( 12 * ( doors + 1 ) ); //4 entries per door + 4 entries for wall corners, each entry has 3 data points
            this.doorData = this.wallData.positions.slice( 3, 3 * ( 4 * doors + 1 ) );

            //For each inner door save corner as an array of four Vector3s, base left, top left, top right, base right
            //Extend door data outwards by ply and save outer door corners
            const doorCornersIn = [];
            const doorCornersOut = [];

            for ( let p = 0; p < this.doorData.length / 12; p++ ) {
                const doorsIn = [];
                const doorsOut = [];
                for ( let d = 0; d < 4; d++ ) {
                    doorsIn.push( new BABYLON.Vector3( this.doorData[ 3 * d + 12 * p ], this.doorData[ 3 * d + 12 * p + 1 ], this.doorData[ 3 * d + 12 * p + 2 ] ) );
                    this.doorData[ 3 * d + 12 * p ] += ply * this.wallNormal.x;
                    this.doorData[ 3 * d + 12 * p + 2 ] += ply * this.wallNormal.z;
                    doorsOut.push( new BABYLON.Vector3( this.doorData[ 3 * d + 12 * p ], this.doorData[ 3 * d + 12 * p + 1 ], this.doorData[ 3 * d + 12 * p + 2 ] ) );
                }
                doorCornersIn.push( doorsIn );
                doorCornersOut.push( doorsOut );
            }
            this.innerDoorCorners.push( doorCornersIn );
            this.outerDoorCorners.push( doorCornersOut );

            //For each inner window save corner as an array of four Vector3s, base left, top left, top right, base right
            //Extend window data outwards by ply and save outer window corners
            const windowCornersIn = [];
            const windowCornersOut = [];

            for ( let p = 0; p < this.windowData.length / 12; p++ ) {
                const windowsIn = [];
                const windowsOut = [];
                for ( let d = 0; d < 4; d++ ) {
                    windowsIn.push( new BABYLON.Vector3( this.windowData[ 3 * d + 12 * p ], this.windowData[ 3 * d + 12 * p + 1 ], this.windowData[ 3 * d + 12 * p + 2 ] ) );
                    this.windowData[ 3 * d + 12 * p ] += ply * this.wallNormal.x;
                    this.windowData[ 3 * d + 12 * p + 2 ] += ply * this.wallNormal.z;
                    windowsOut.push( new BABYLON.Vector3( this.windowData[ 3 * d + 12 * p ], this.windowData[ 3 * d + 12 * p + 1 ], this.windowData[ 3 * d + 12 * p + 2 ] ) );
                }
                windowCornersIn.push( windowsIn );
                windowCornersOut.push( windowsOut );
            }
            this.innerWindowCorners.push( windowCornersIn );
            this.outerWindowCorners.push( windowCornersOut );

            //Construct OUTER wall facet positions from inner wall
            //Add outer wall corner positions back to wallData positions
            this.wallData.positions = [];

            this.wallData.positions.push( this.outerBaseCorners[ w ].x, this.outerBaseCorners[ w ].y, this.outerBaseCorners[ w ].z );
            this.wallData.positions = this.wallData.positions.concat( this.doorData );
            this.wallData.positions.push( this.outerBaseCorners[ w + 1 ].x, this.outerBaseCorners[ w + 1 ].y, this.outerBaseCorners[ ( w + 1 ) % nbWalls ].z );
            this.wallData.positions.push( this.outerTopCorners[ w + 1 ].x, this.outerTopCorners[ w + 1 ].y, this.outerTopCorners[ ( w + 1 ) % nbWalls ].z );
            this.wallData.positions.push( this.outerTopCorners[ w ].x, this.outerTopCorners[ w ].y, this.outerTopCorners[ w ].z );
            this.wallData.positions = this.wallData.positions.concat( this.windowData );

            //Calulate exterior wall uvs
            this.polygonTriangulation._points.elements.forEach( ( p ) => {
                if ( p.x == 0 ) {
                    this.uvx = exteriorUV.x;
                } else if ( this.wallLength - p.x < 0.000001 ) {
                    this.uvx = exteriorUV.x + ( this.wallDiff + p.x ) * ( exteriorUV.z - exteriorUV.x ) / ( this.maxL + this.wallDiff )
                } else {
                    this.uvx = exteriorUV.x + ( 0.5 * this.wallDiff + p.x ) * ( exteriorUV.z - exteriorUV.x ) / ( this.maxL + this.wallDiff );
                }
                this.uvy = exteriorUV.y + p.y * ( exteriorUV.w - exteriorUV.y ) / height;
                this.uvs.push( this.uvx, this.uvy );
            } )

            this.nbIndices = this.positions.length / 3; // current number of indices

            //Add outer wall positions, uvs and colors (repeated for flat shaded mesh)
            this.positions = this.positions.concat( this.wallData.positions );


            //Reverse indices for correct normals
            this.wallData.indices.reverse();

            this.indices = this.indices.concat( this.wallData.indices.map( ( idx ) => {
                return idx + this.nbIndices;
            } ) )

            //Construct facets for base and door top and door sides, repeating positions for flatshaded mesh
            let doorsRemaining = doors;
            let doorNb = 0;

            if ( doorsRemaining > 0 ) {
                //base
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerBaseCorners[ w ].x, this.innerBaseCorners[ w ].y, this.innerBaseCorners[ w ].z ); //tl
                this.positions.push( this.outerBaseCorners[ w ].x, this.outerBaseCorners[ w ].y, this.outerBaseCorners[ w ].z ); //bl
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 0 ].x, this.innerDoorCorners[ w ][ doorNb ][ 0 ].y, this.innerDoorCorners[ w ][ doorNb ][ 0 ].z ); //tr
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 0 ].x, this.outerDoorCorners[ w ][ doorNb ][ 0 ].y, this.outerDoorCorners[ w ][ doorNb ][ 0 ].z ); //br

                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].doorSpaces[ doorNb ].left / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].doorSpaces[ doorNb ].left / this.maxL, exteriorUV.y ); //base right

                this.indices.push( this.nbIndices, this.nbIndices + 2, this.nbIndices + 3, this.nbIndices + 3, this.nbIndices + 1, this.nbIndices );

                //left side
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 0 ].x, this.innerDoorCorners[ w ][ doorNb ][ 0 ].y, this.innerDoorCorners[ w ][ doorNb ][ 0 ].z ); //br
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 1 ].x, this.innerDoorCorners[ w ][ doorNb ][ 1 ].y, this.innerDoorCorners[ w ][ doorNb ][ 1 ].z ); //tr
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 0 ].x, this.outerDoorCorners[ w ][ doorNb ][ 0 ].y, this.outerDoorCorners[ w ][ doorNb ][ 0 ].z ); //bl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 1 ].x, this.outerDoorCorners[ w ][ doorNb ][ 1 ].y, this.outerDoorCorners[ w ][ doorNb ][ 1 ].z ); //tl

                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top right
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top Left

                this.indices.push( this.nbIndices, this.nbIndices + 1, this.nbIndices + 3, this.nbIndices, this.nbIndices + 3, this.nbIndices + 2 );

                //top
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 1 ].x, this.innerDoorCorners[ w ][ doorNb ][ 1 ].y, this.innerDoorCorners[ w ][ doorNb ][ 1 ].z ); //bl
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 2 ].x, this.innerDoorCorners[ w ][ doorNb ][ 2 ].y, this.innerDoorCorners[ w ][ doorNb ][ 2 ].z ); //br
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 1 ].x, this.outerDoorCorners[ w ][ doorNb ][ 1 ].y, this.outerDoorCorners[ w ][ doorNb ][ 1 ].z ); //tl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 2 ].x, this.outerDoorCorners[ w ][ doorNb ][ 2 ].y, this.outerDoorCorners[ w ][ doorNb ][ 2 ].z ); //tr

                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].doorSpaces[ doorNb ].door.width / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].doorSpaces[ doorNb ].door.width / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right

                this.indices.push( this.nbIndices + 2, this.nbIndices + 1, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices, this.nbIndices + 1 );

                //right side
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 2 ].x, this.innerDoorCorners[ w ][ doorNb ][ 2 ].y, this.innerDoorCorners[ w ][ doorNb ][ 2 ].z ); //tl
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 3 ].x, this.innerDoorCorners[ w ][ doorNb ][ 3 ].y, this.innerDoorCorners[ w ][ doorNb ][ 3 ].z ); //bl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 2 ].x, this.outerDoorCorners[ w ][ doorNb ][ 2 ].y, this.outerDoorCorners[ w ][ doorNb ][ 2 ].z ); //tr
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 3 ].x, this.outerDoorCorners[ w ][ doorNb ][ 3 ].y, this.outerDoorCorners[ w ][ doorNb ][ 3 ].z ); //br

                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top Left
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y ); //base right

                this.indices.push( this.nbIndices, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices, this.nbIndices + 1, this.nbIndices + 3 );
            }
            doorsRemaining--
            doorNb++

            while ( doorsRemaining > 0 ) {

                //base
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb - 1 ][ 3 ].x, this.innerDoorCorners[ w ][ doorNb - 1 ][ 3 ].y, this.innerDoorCorners[ w ][ doorNb - 1 ][ 3 ].z ); //bl
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 0 ].x, this.innerDoorCorners[ w ][ doorNb ][ 0 ].y, this.innerDoorCorners[ w ][ doorNb ][ 0 ].z ); //br
                this.positions.push( this.outerDoorCorners[ w ][ doorNb - 1 ][ 3 ].x, this.outerDoorCorners[ w ][ doorNb - 1 ][ 3 ].y, this.outerDoorCorners[ w ][ doorNb - 1 ][ 3 ].z ); //tl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 0 ].x, this.outerDoorCorners[ w ][ doorNb ][ 0 ].y, this.outerDoorCorners[ w ][ doorNb ][ 0 ].z ); //tr

                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ( walls[ w ].doorSpaces[ doorNb ].left - ( walls[ w ].doorSpaces[ doorNb - 1 ].left + walls[ w ].doorSpaces[ doorNb - 1 ].door.width ) ) / this.maxL / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ( walls[ w ].doorSpaces[ doorNb ].left - ( walls[ w ].doorSpaces[ doorNb - 1 ].left + walls[ w ].doorSpaces[ doorNb - 1 ].door.width ) ) / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right

                this.indices.push( this.nbIndices, this.nbIndices + 1, this.nbIndices + 3, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices );

                //left side
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 0 ].x, this.innerDoorCorners[ w ][ doorNb ][ 0 ].y, this.innerDoorCorners[ w ][ doorNb ][ 0 ].z ); //br
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 1 ].x, this.innerDoorCorners[ w ][ doorNb ][ 1 ].y, this.innerDoorCorners[ w ][ doorNb ][ 1 ].z ); //tr
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 0 ].x, this.outerDoorCorners[ w ][ doorNb ][ 0 ].y, this.outerDoorCorners[ w ][ doorNb ][ 0 ].z ); //bl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 1 ].x, this.outerDoorCorners[ w ][ doorNb ][ 1 ].y, this.outerDoorCorners[ w ][ doorNb ][ 1 ].z ); //tl

                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top right
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top Left

                this.indices.push( this.nbIndices, this.nbIndices + 1, this.nbIndices + 3, this.nbIndices, this.nbIndices + 3, this.nbIndices + 2 );

                //top
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 1 ].x, this.innerDoorCorners[ w ][ doorNb ][ 1 ].y, this.innerDoorCorners[ w ][ doorNb ][ 1 ].z ); //bl
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 2 ].x, this.innerDoorCorners[ w ][ doorNb ][ 2 ].y, this.innerDoorCorners[ w ][ doorNb ][ 2 ].z ); //br
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 1 ].x, this.outerDoorCorners[ w ][ doorNb ][ 1 ].y, this.outerDoorCorners[ w ][ doorNb ][ 1 ].z ); //tl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 2 ].x, this.outerDoorCorners[ w ][ doorNb ][ 2 ].y, this.outerDoorCorners[ w ][ doorNb ][ 2 ].z ); //tr

                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].doorSpaces[ doorNb ].door.width / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].doorSpaces[ doorNb ].door.width / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right

                this.indices.push( this.nbIndices + 2, this.nbIndices + 1, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices, this.nbIndices + 1 );

                //right side
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 2 ].x, this.innerDoorCorners[ w ][ doorNb ][ 2 ].y, this.innerDoorCorners[ w ][ doorNb ][ 2 ].z ); //tl
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 3 ].x, this.innerDoorCorners[ w ][ doorNb ][ 3 ].y, this.innerDoorCorners[ w ][ doorNb ][ 3 ].z ); //bl
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 2 ].x, this.outerDoorCorners[ w ][ doorNb ][ 2 ].y, this.outerDoorCorners[ w ][ doorNb ][ 2 ].z ); //tr
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 3 ].x, this.outerDoorCorners[ w ][ doorNb ][ 3 ].y, this.outerDoorCorners[ w ][ doorNb ][ 3 ].z ); //br

                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top Left
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].doorSpaces[ doorNb ].door.height / maxH ); //top right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y ); //base right

                this.indices.push( this.nbIndices, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices, this.nbIndices + 1, this.nbIndices + 3 );

                doorsRemaining--
                doorNb++

            }

            doorNb--;
            this.nbIndices = this.positions.length / 3; // current number of indices

            //final base
            if ( doors > 0 ) {
                this.positions.push( this.innerDoorCorners[ w ][ doorNb ][ 3 ].x, this.innerDoorCorners[ w ][ doorNb ][ 3 ].y, this.innerDoorCorners[ w ][ doorNb ][ 3 ].z ); //bl
                this.positions.push( this.innerBaseCorners[ w + 1 ].x, this.innerBaseCorners[ w + 1 ].y, this.innerBaseCorners[ w + 1 ].z ); //br
                this.positions.push( this.outerDoorCorners[ w ][ doorNb ][ 3 ].x, this.outerDoorCorners[ w ][ doorNb ][ 3 ].y, this.outerDoorCorners[ w ][ doorNb ][ 3 ].z ); //tl
                this.positions.push( this.outerBaseCorners[ w + 1 ].x, this.outerBaseCorners[ w + 1 ].y, this.outerBaseCorners[ w + 1 ].z ); //tr

                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ( this.wallLength - ( walls[ w ].doorSpaces[ doorNb ].left + walls[ w ].doorSpaces[ doorNb ].door.width ) ) / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ( this.wallLength - ( walls[ w ].doorSpaces[ doorNb ].left + walls[ w ].doorSpaces[ doorNb ].door.width ) ) / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right

            } else {
                this.positions.push( this.innerBaseCorners[ w ].x, this.innerBaseCorners[ w ].y, this.innerBaseCorners[ w ].z ); //bl
                this.positions.push( this.innerBaseCorners[ w + 1 ].x, this.innerBaseCorners[ w + 1 ].y, this.innerBaseCorners[ w + 1 ].z ); //br
                this.positions.push( this.outerBaseCorners[ w ].x, this.outerBaseCorners[ w ].y, this.outerBaseCorners[ w ].z ); //tl
                this.positions.push( this.outerBaseCorners[ w + 1 ].x, this.outerBaseCorners[ w + 1 ].y, this.outerBaseCorners[ w + 1 ].z ); //tr

                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * this.wallLength / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * this.wallLength / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right

            }
            this.indices.push( this.nbIndices, this.nbIndices + 1, this.nbIndices + 3, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices );

            //Construct facets for window base, top and sides, repeating positions for flatshaded mesh
            for ( let ww = 0; ww < this.innerWindowCorners[ w ].length; ww++ ) {
                //left side
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 3 ].x, this.innerWindowCorners[ w ][ ww ][ 3 ].y, this.innerWindowCorners[ w ][ ww ][ 3 ].z ); //tr
                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 0 ].x, this.innerWindowCorners[ w ][ ww ][ 0 ].y, this.innerWindowCorners[ w ][ ww ][ 0 ].z ); //br
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 3 ].x, this.outerWindowCorners[ w ][ ww ][ 3 ].y, this.outerWindowCorners[ w ][ ww ][ 3 ].z ); //tl
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 0 ].x, this.outerWindowCorners[ w ][ ww ][ 0 ].y, this.outerWindowCorners[ w ][ ww ][ 0 ].z ); //bl

                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].windowSpaces[ ww ].window.height / maxH ); //top right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].windowSpaces[ ww ].window.height / maxH ); //top Left
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left

                this.indices.push( this.nbIndices + 1, this.nbIndices, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices + 3, this.nbIndices );

                //base
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 0 ].x, this.innerWindowCorners[ w ][ ww ][ 0 ].y, this.innerWindowCorners[ w ][ ww ][ 0 ].z ); //tl
                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 1 ].x, this.innerWindowCorners[ w ][ ww ][ 1 ].y, this.innerWindowCorners[ w ][ ww ][ 1 ].z ); //tr
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 0 ].x, this.outerWindowCorners[ w ][ ww ][ 0 ].y, this.outerWindowCorners[ w ][ ww ][ 0 ].z ); //bl
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 1 ].x, this.outerWindowCorners[ w ][ ww ][ 1 ].y, this.outerWindowCorners[ w ][ ww ][ 1 ].z ); //br

                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].windowSpaces[ ww ].window.width / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].windowSpaces[ ww ].window.width / this.maxL, exteriorUV.y ); //base right

                this.indices.push( this.nbIndices + 1, this.nbIndices, this.nbIndices + 3, this.nbIndices + 3, this.nbIndices, this.nbIndices + 2 );

                //right side
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 1 ].x, this.innerWindowCorners[ w ][ ww ][ 1 ].y, this.innerWindowCorners[ w ][ ww ][ 1 ].z ); //bl
                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 2 ].x, this.innerWindowCorners[ w ][ ww ][ 2 ].y, this.innerWindowCorners[ w ][ ww ][ 2 ].z ); //tl
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 1 ].x, this.outerWindowCorners[ w ][ ww ][ 1 ].y, this.outerWindowCorners[ w ][ ww ][ 1 ].z ); //br
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 2 ].x, this.outerWindowCorners[ w ][ ww ][ 2 ].y, this.outerWindowCorners[ w ][ ww ][ 2 ].z ); //tr

                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].windowSpaces[ ww ].window.height / maxH ); //top Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * ply / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ), exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * walls[ w ].windowSpaces[ ww ].window.height / maxH ); //top right

                this.indices.push( this.nbIndices + 1, this.nbIndices + 2, this.nbIndices + 3, this.nbIndices, this.nbIndices + 2, this.nbIndices + 1 );

                //top
                this.nbIndices = this.positions.length / 3; // current number of indices

                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 2 ].x, this.innerWindowCorners[ w ][ ww ][ 2 ].y, this.innerWindowCorners[ w ][ ww ][ 2 ].z ); //br
                this.positions.push( this.innerWindowCorners[ w ][ ww ][ 3 ].x, this.innerWindowCorners[ w ][ ww ][ 3 ].y, this.innerWindowCorners[ w ][ ww ][ 3 ].z ); //bl
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 2 ].x, this.outerWindowCorners[ w ][ ww ][ 2 ].y, this.outerWindowCorners[ w ][ ww ][ 2 ].z ); //tr
                this.positions.push( this.outerWindowCorners[ w ][ ww ][ 3 ].x, this.outerWindowCorners[ w ][ ww ][ 3 ].y, this.outerWindowCorners[ w ][ ww ][ 3 ].z ); //tl

                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].windowSpaces[ ww ].window.width / this.maxL, exteriorUV.y ); //base right
                this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
                this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * walls[ w ].windowSpaces[ ww ].window.width / this.maxL, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right
                this.uvs.push( exteriorUV.x, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left

                this.indices.push( this.nbIndices + 3, this.nbIndices, this.nbIndices + 2, this.nbIndices + 1, this.nbIndices, this.nbIndices + 3 );

            }

            //Construction of top of wall facets
            this.nbIndices = this.positions.length / 3; // current number of indices

            this.positions.push( this.innerTopCorners[ w ].x, this.innerTopCorners[ w ].y, this.innerTopCorners[ w ].z ); //tl
            this.positions.push( this.innerTopCorners[ w + 1 ].x, this.innerTopCorners[ w + 1 ].y, this.innerTopCorners[ w + 1 ].z ); //tr
            this.positions.push( this.outerTopCorners[ w ].x, this.outerTopCorners[ w ].y, this.outerTopCorners[ w ].z ); //bl
            this.positions.push( this.outerTopCorners[ w + 1 ].x, this.outerTopCorners[ w + 1 ].y, this.outerTopCorners[ w + 1 ].z ); //br

            this.uvx = exteriorUV.x + 0.5 * this.wallDiff * ( exteriorUV.z - exteriorUV.x ) / this.maxL;
            this.uvs.push( this.uvx, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top Left

            this.uvx = exteriorUV.x + ( 0.5 * this.wallDiff + this.wallLength ) * ( exteriorUV.z - exteriorUV.x ) / this.maxL;
            this.uvs.push( this.uvx, exteriorUV.y + ( exteriorUV.w - exteriorUV.y ) * ply / maxH ); //top right

            this.uvs.push( exteriorUV.x, exteriorUV.y ); //base Left
            this.uvs.push( exteriorUV.x + ( exteriorUV.z - exteriorUV.x ) * this.exteriorWallLength / ( this.maxL + this.wallDiff ), exteriorUV.y ); //base right

            this.indices.push( this.nbIndices + 1, this.nbIndices, this.nbIndices + 3, this.nbIndices + 2, this.nbIndices + 3, this.nbIndices );

            for ( let p = this.interiorIndex; p < this.positions.length / 3; p++ ) {
                this.colors.push( exteriorColor.r, exteriorColor.g, exteriorColor.b, exteriorColor.a );
            }


        }

        const normals = [];

        BABYLON.VertexData.ComputeNormals( this.positions, this.indices, normals );
        BABYLON.VertexData._ComputeSides( BABYLON.Mesh.FRONTSIDE, this.positions, this.indices, normals, this.uvs );


        //Create a custom mesh
        const customMesh = new BABYLON.Mesh( "custom", scene );

        //Create a vertexData object
        const vertexData = new BABYLON.VertexData();

        //Assign positions and indices to vertexData
        vertexData.positions = this.positions;
        vertexData.indices = this.indices;
        vertexData.normals = normals;
        vertexData.uvs = this.uvs;
        vertexData.colors = this.colors;

        //Apply vertexData to custom mesh
        vertexData.applyToMesh( customMesh );

        return customMesh;

    }

}
