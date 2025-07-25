import * as utils from '../utils.js'

const POLE_HEIGHT = 10;
const POLE_RADIUS = 0.7;
const HOOP_HEIGHT = 10;
const BOARD_SCALE = 3;
const RIM_RADIUS = 0.9;

function BasketballHoops() {
    const hoopsGroup = new THREE.Group();

    const leftHoop = createSingleHoop();
    leftHoop.position.set(-45, 0, 0);
    leftHoop.rotation.y = Math.PI / 2;
    leftHoop.collidableParts = getCollidableHoopParts(leftHoop)

    const rightHoop = createSingleHoop();
    rightHoop.position.set(45, 0, 0);
    rightHoop.rotation.y = -Math.PI / 2;
    rightHoop.castShadow = true
    rightHoop.collidableParts = getCollidableHoopParts(rightHoop)

    hoopsGroup.add(leftHoop);
    hoopsGroup.add(rightHoop);

    return {
        leftHoop: leftHoop,
        rightHoop: rightHoop,
    };
}

function createSingleHoop() {
    const hoop = new THREE.Group();

    const pole = createBasketballPole();
    const board = createBasketballBoard();
    const supportArm = createSupportArm();
    const rim = createBasketballRim();
    // const net = createBasketballNet();

    hoop.add(pole, board, supportArm, rim);
    return hoop;
}

function createBasketballPole() {
    const poleGeometry = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 8);
    const poleMaterial = new THREE.MeshPhongMaterial({ color: utils.COLORS.BLACK });

    const pole = new THREE.Mesh(poleGeometry, poleMaterial);

    pole.position.set(0, POLE_HEIGHT / 2, -2);
    pole.castShadow = true;
    pole.receiveShadow = true;
    pole.name = 'pole';
    return pole;
}

function createSupportArm() {
    const armGeometry = new THREE.BoxGeometry(0.2, 0.2, 1.8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: utils.COLORS.BLACK });
    const arm = new THREE.Mesh(armGeometry, armMaterial);

    arm.position.set(0, HOOP_HEIGHT - 0.5, -1);
    arm.castShadow = true;
    arm.name = 'arm';
    return arm;
}

function createBasketballBoard() {
    const boardGroup = new THREE.Group();

    const backboardGeometry = new THREE.BoxGeometry(1.83 * BOARD_SCALE, 1.22 * BOARD_SCALE, 0.05);
    const backboardMaterial = new THREE.MeshPhongMaterial({
        color: utils.COLORS.WHITE,
        transparent: true,
        opacity: 0.3
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    boardGroup.add(backboard);

    const borderThickness = 0.03 * BOARD_SCALE;
    const boardWidth = 1.83 * BOARD_SCALE;
    const boardHeight = 1.22 * BOARD_SCALE;

    const topBorder = new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth, borderThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    topBorder.position.set(0, boardHeight / 2 - borderThickness / 2, 0.001);
    boardGroup.add(topBorder);

    const bottomBorder = new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth, borderThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    bottomBorder.position.set(0, -boardHeight / 2 + borderThickness / 2, 0.001);
    boardGroup.add(bottomBorder);

    const leftBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, boardHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    leftBorder.position.set(-boardWidth / 2 + borderThickness / 2, 0, 0.001);
    boardGroup.add(leftBorder);

    const rightBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, boardHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    rightBorder.position.set(boardWidth / 2 - borderThickness / 2, 0, 0.001);
    boardGroup.add(rightBorder);

    const innerThickness = 0.008 * BOARD_SCALE;
    const squareWidth = 0.61 * BOARD_SCALE;
    const squareHeight = 0.457 * BOARD_SCALE;

    const innerTop = new THREE.Mesh(
        new THREE.BoxGeometry(squareWidth, innerThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerTop.position.set(0, squareHeight / 2, 0.002);
    boardGroup.add(innerTop);

    const innerBottom = new THREE.Mesh(
        new THREE.BoxGeometry(squareWidth, innerThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerBottom.position.set(0, -squareHeight / 2, 0.002);
    boardGroup.add(innerBottom);

    const innerLeft = new THREE.Mesh(
        new THREE.BoxGeometry(innerThickness, squareHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerLeft.position.set(-squareWidth / 2, 0, 0.002);
    boardGroup.add(innerLeft);

    const innerRight = new THREE.Mesh(
        new THREE.BoxGeometry(innerThickness, squareHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerRight.position.set(squareWidth / 2, 0, 0.002);
    boardGroup.add(innerRight);

    boardGroup.position.set(0, HOOP_HEIGHT - 0.5, -0.15);
    boardGroup.children.forEach(child => {
        child.castShadow = true;
        child.receiveShadow = true;
    });
    boardGroup.name = 'board';
    return boardGroup;
}

function createBasketballNet(rimY, rimZ) {

    /* 1 ─ choose basic proportions (tweak at will) */
    const rTop = RIM_RADIUS * 0.8;    // top radius – just inside the rim
    const rBottom = RIM_RADIUS;   // bottom radius – taper
    const hNet = 1.3;                 // net depth in metres

    /* 2 ─ create a *plain* cylinder just to steal its vertices
           radialSegs & heightSegs control diamond density          */
    const radialSegs = 8;   // more = finer diamonds round-the-rim
    const heightSegs = 8;    // more = more rows of diamonds down the net

    const cyl = new THREE.CylinderGeometry(
        rBottom, rTop, hNet,
        radialSegs, heightSegs,
        true                         // openEnded → no caps
    );
    cyl.rotateY(Math.PI / radialSegs);    // centre the diamonds nicely

    /* 3 ─ build our own BufferGeometry containing ONLY diagonals     */
    const srcPos = cyl.getAttribute('position');   // read-only helper
    const positions = [];                          // will hold X,Y,Z triples

    /* helper – push vertex i’s xyz into positions */
    const add = (i) => {
        positions.push(srcPos.getX(i), srcPos.getY(i), srcPos.getZ(i));
    };

    /* mapping: for each grid square (i , j) … */
    const cols = radialSegs + 1;   // +1 because CylinderGeometry repeats the first column to close the seam
    for (let j = 0; j < heightSegs; ++j) {
        for (let i = 0; i < radialSegs; ++i) {

            /* square’s four corners in the vertex buffer            */
            const a = j * cols + i;       // lower-left
            const b = j * cols + (i + 1);  // lower-right
            const c = (j + 1) * cols + i;       // upper-left
            const d = (j + 1) * cols + (i + 1);  // upper-right

            /* two crossing diagonals:  a─d  and  b─c                */
            add(a); add(d);      // first diagonal segment
            add(b); add(c);      // second diagonal segment
        }
    }

    /* 4 ─ wrap those coordinates into a LineSegments mesh            */
    const diagGeom = new THREE.BufferGeometry();
    diagGeom.setAttribute('position',
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const basketballNet = new THREE.LineSegments(
        diagGeom,
        new THREE.LineBasicMaterial({ color: utils.COLORS.WHITE })
    );

    /* 5 ─ hang the net so its *top edge* kisses the rim’s underside  */
    basketballNet.position.set(0, rimY - hNet / 2, rimZ);
    basketballNet.castShadow = true
    basketballNet.name = 'basketballNet';
    return basketballNet;
}

function createBasketballRim() {
    const rimGroup = new THREE.Group();

    const rimGeometry = new THREE.TorusGeometry(RIM_RADIUS, 0.04, 8, 50);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6600 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);

    const connectorLength = RIM_RADIUS + 0.08 * 4;
    const connectorGeometry = new THREE.BoxGeometry(connectorLength, 0.1 * 2, 0.1 * 2);
    const connectorMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6600 });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);

    const squareHeight = 0.457 * BOARD_SCALE;
    const backboardThickness = 0.05;

    const connectorY = HOOP_HEIGHT - 0.5 + (-squareHeight / 2);
    const connectorZ = backboardThickness / 2;

    connector.position.set(connectorZ, connectorY, 0);
    connector.name = 'connector';

    const rimY = connectorY;
    const rimZ = 0.11 + RIM_RADIUS;

    const net = createBasketballNet(rimY, rimZ);

    rim.position.set(0, rimY, rimZ);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    rim.name = 'rim';

    rimGroup.add(connector);
    rimGroup.add(rim);
    rimGroup.add(net);
    rimGroup.name = 'hoop'
    return rimGroup;
}

function getCollidableHoopParts(hoopGroup) {
    const collidable = [];
    hoopGroup.traverse(child => {
        if (child.isMesh) {
            collidable.push(child);
        }
    });
    return collidable;
}

export { BasketballHoops };