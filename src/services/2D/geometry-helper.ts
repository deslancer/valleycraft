export class GeometryHelper {

    areaForCentroidFloor( points: any ) {
        let area = 0;
        let pts = points;
        let nPts = pts.length;
        let j = nPts - 1;
        let p1;
        let p2;

        for ( let i = 0; i < nPts; j = i++ ) {
            p1 = pts[ i ];
            p2 = pts[ j ];
            area += p1.x * p2.y;
            area -= p1.y * p2.x;
        }
        area /= 2;

        return area;
    }


    getPolygonCenter( vertices: any ) {
        let pts = vertices;
        let nPts = pts.length;
        let x = 0;
        let y = 0;
        let f;
        let j = nPts - 1;
        let p1;
        let p2;

        for ( let i = 0; i < nPts; j = i++ ) {
            p1 = pts[ i ];
            p2 = pts[ j ];
            f = p1.x * p2.y - p2.x * p1.y;
            x += ( p1.x + p2.x ) * f;
            y += ( p1.y + p2.y ) * f;
        }

        f = this.areaForCentroidFloor( vertices ) * 6;
        return { x: x / f, y: y / f };
    }

}
