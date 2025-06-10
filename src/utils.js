///////////////////////
// CONSTANTS
///////////////////////
export const LAYER_OFFSET = 0.15
const LINE_WIDTH = 0.5
export const COLORS = {
    BLACK: 0x000000
    , WHITE: 0xffffff
    , BROWN: 0xc68642
    , GREEN: 0x008348
}
///////////////////////
// MATH HELPERS
///////////////////////
function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function getLayerHeight(height, layerNum = 0) {
    return height / 2 + layerNum * LAYER_OFFSET
}

///////////////////////
// SHAPE HELPERS
///////////////////////
function Ring(x_offset, y_offset, z_offset, radius) {
    const geometry = new THREE.RingGeometry(radius - LINE_WIDTH / 2, radius + LINE_WIDTH / 2, 32);
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: COLORS.WHITE });
    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(x_offset, y_offset, z_offset);
    return circle
}

function Rectangle(x_offset, y_offset, z_offset, W = 30, D = 15) {
    const wOuter = W / 2 + LINE_WIDTH / 2;
    const dOuter = D / 2 + LINE_WIDTH / 2;
    const wInner = wOuter - LINE_WIDTH;
    const dInner = dOuter - LINE_WIDTH;

    // --- 1.  outer contour (clockwise) ---
    const shape = new THREE.Shape();
    shape.moveTo(-wOuter, -dOuter);   // TL
    shape.lineTo(wOuter, -dOuter);   // TR
    shape.lineTo(wOuter, dOuter);   // BR
    shape.lineTo(-wOuter, dOuter);   // BL
    shape.lineTo(-wOuter, -dOuter);   // close

    // --- 2.  inner hole (counter-clockwise!) ---
    const hole = new THREE.Path();
    hole.moveTo(-wInner, -dInner);    // TL
    hole.lineTo(-wInner, dInner);    // BL
    hole.lineTo(wInner, dInner);    // BR
    hole.lineTo(wInner, -dInner);    // TR
    hole.lineTo(-wInner, -dInner);    // close

    shape.holes.push(hole);

    // --- 3.  convert to geometry ---
    const segments = 4;               // rectangles need only 4 but leave default fine
    const geo2D = new THREE.ShapeGeometry(shape, segments);

    // lie flat on the court (XZ plane → rotate about X)
    geo2D.rotateX(-Math.PI / 2);

    // Create a visible mesh from the geometry
    const material = new THREE.MeshBasicMaterial({ color: COLORS.WHITE, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo2D, material);
    mesh.position.set(x_offset, y_offset, z_offset);
    mesh.receiveShadow = true;
    return mesh;
}

function Line(x1, y1, z1, x2, y2, z2) {
    // 1.  compute start/end vectors and the segment length
    const start = new THREE.Vector3(x1, y1, z1);
    const end = new THREE.Vector3(x2, y2, z2);
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    // 2.  build a flat plane of size [ length × LINE_WIDTH ]
    const geometry = new THREE.PlaneGeometry(length, LINE_WIDTH);
    // lie it flat (plane is XY by default → XZ)
    geometry.rotateX(-Math.PI / 2);

    // 3.  rotate around Y so its long edge points from start→end
    const angle = Math.atan2(z2 - z1, x2 - x1);
    geometry.rotateY(angle);

    // 4.  create the mesh
    const material = new THREE.MeshBasicMaterial({
        color: COLORS.WHITE,
        side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);

    // 5.  move it into place (centered between start & end)
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mesh.position.copy(midpoint);

    mesh.receiveShadow = true;
    return mesh;
}

function Arc(
    x1, y1, z1,
    x2_offset, y2_offset, z2_offset, // midpoint on the arc
    x3, y3, z3,
    divisions = 64
) {
    // 1) Pack points
    const p1 = new THREE.Vector3(x1, y1, z1);
    const p2 = new THREE.Vector3(x2_offset, y2_offset, z2_offset);
    const p3 = new THREE.Vector3(x3, y3, z3);

    // 2) Compute vectors in the plane of the three points
    const a = p2.clone().sub(p1);            // A → B
    const b = p3.clone().sub(p1);            // A → C
    const n = a.clone().cross(b);            // plane normal A×B
    const nLenSq = n.lengthSq();
    if (nLenSq === 0) {
        console.warn('Arc(): points are colinear; falling back to straight ribbon.');
        // Fallback: simply draw a straight ribbon between p1→p3:
        return Arc(x1, y1, z1, (x1 + x3) / 2, (y1 + y3) / 2, (z1 + z3) / 2, x3, y3, z3, divisions);
    }

    // 3) Circumcenter formula (vector form)
    const aLenSq = a.dot(a);
    const bLenSq = b.dot(b);
    const term1 = b.clone().multiplyScalar(aLenSq).cross(n);
    const term2 = n.clone().cross(a.clone().multiplyScalar(bLenSq));
    // center = A + (term1 + term2) / (2 |n|²)
    const center = p1.clone().add(term1.add(term2).divideScalar(2 * nLenSq));

    // 4) Radius of the circle
    const radius = center.distanceTo(p1);

    // 5) Build an ON basis (u,v) in the circle’s plane:
    //    u = unit vector from center → p1
    //    v = unit vector orthogonal in the plane
    const u = p1.clone().sub(center).normalize();
    const planeNormal = n.clone().normalize();
    const v = planeNormal.clone().cross(u).normalize();

    // 6) Compute each point’s polar angle around the center
    function angleOf(pt) {
        const d = pt.clone().sub(center);
        return Math.atan2(d.dot(v), d.dot(u));
    }
    let a1 = angleOf(p1);
    let a2 = angleOf(p2);
    let a3 = angleOf(p3);

    // wrap into [0, 2π)
    const TWO_PI = Math.PI * 2;
    [a1, a2, a3] = [a1, a2, a3].map(a => (a % TWO_PI + TWO_PI) % TWO_PI);

    // 7) Choose the shorter or longer arc so that it *does* pass through p2
    let delta13 = a3 - a1;
    if (delta13 < 0) delta13 += TWO_PI;
    let delta12 = a2 - a1;
    if (delta12 < 0) delta12 += TWO_PI;
    // if p2 lies *outside* the [a1→a3] range, go the “other way” (negative sweep)
    if (delta12 > delta13) {
        delta13 -= TWO_PI;
    }

    // 8) Sample points along that arc
    const pts = [];
    for (let i = 0; i <= divisions; i++) {
        const t = i / divisions;
        const ang = a1 + delta13 * t;
        // reconstruct in 3D: center + (cos·u + sin·v)·radius
        pts.push(
            center.clone()
                .add(u.clone().multiplyScalar(Math.cos(ang) * radius))
                .add(v.clone().multiplyScalar(Math.sin(ang) * radius))
        );
    }

    // 9) Build the ribbon exactly as before
    const halfW = LINE_WIDTH / 2;
    const positions = [];
    for (let i = 0; i < pts.length - 1; i++) {
        const A = pts[i];
        const B = pts[i + 1];

        const T = B.clone().sub(A).normalize();        // tangent
        const N = planeNormal.clone().cross(T).normalize(); // in-plane normal

        const AL = A.clone().addScaledVector(N, halfW);
        const AR = A.clone().addScaledVector(N, -halfW);
        const BL = B.clone().addScaledVector(N, halfW);
        const BR = B.clone().addScaledVector(N, -halfW);

        positions.push(
            AL.x, AL.y, AL.z,
            AR.x, AR.y, AR.z,
            BL.x, BL.y, BL.z,

            AR.x, AR.y, AR.z,
            BR.x, BR.y, BR.z,
            BL.x, BL.y, BL.z
        );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
        color: COLORS.WHITE,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    return mesh;
}



export { Rectangle, Ring, Line, Arc, getLayerHeight }