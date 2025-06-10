export const LAYER_OFFSET = 0.01
const LINE_WIDTH = 0.5

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function Ring(x_offset, y_offset, z_offset, radius) {
    const geometry = new THREE.RingGeometry(radius - LINE_WIDTH / 2, radius + LINE_WIDTH / 2, 32);
    geometry.rotateX(-Math.PI / 2)
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const circle = new THREE.Mesh(geometry, material);
    circle.position.set(x_offset, y_offset, z_offset);
    return circle
}

function Rectangle(x_offset, y_offset, z_offset, W = 30, D = 15) {
    const wOuter = W / 2;
    const dOuter = D / 2;
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
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo2D, material);
    mesh.position.set(x_offset, y_offset, z_offset);
    mesh.receiveShadow = true;
    return mesh;
}

export { Rectangle, Ring }