import * as utils from '../utils.js'

const POLE_HEIGHT = 10;
const POLE_RADIUS = 0.7;
const HOOP_HEIGHT = 10; 
const BOARD_SCALE = 3;
const RIM_RADIUS = 0.9;

function BasketballHoops() {  
    const hoopsGroup = new THREE.Group();
    
    const leftHoop = createSingleHoop();
    leftHoop.position.set(-45.78, 0, 0);
    leftHoop.rotation.y = Math.PI / 2;

    const rightHoop = createSingleHoop();
    rightHoop.position.set(0, 0, 0);
    rightHoop.rotation.y = -Math.PI / 2;
    
    hoopsGroup.add(leftHoop);
    hoopsGroup.add(rightHoop);
    
    return {
        object: hoopsGroup,
        baseHeight: 0
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
        const poleMaterial = new THREE.MeshPhongMaterial({ color: utils.COLORS.BLACK});
        
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        
        pole.position.set(0, POLE_HEIGHT / 2, -2);
        pole.castShadow = true;
        pole.receiveShadow = true;
        return pole;
}

function createSupportArm() {
    const armGeometry = new THREE.BoxGeometry(0.2, 0.2, 1.8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: utils.COLORS.BLACK }); 
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    
    arm.position.set(0, HOOP_HEIGHT - 0.5, -1);
    arm.castShadow = true;
    return arm;
}

function createBasketballBoard(){
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
    topBorder.position.set(0, boardHeight/2 - borderThickness/2, 0.001);
    boardGroup.add(topBorder);
    
    const bottomBorder = new THREE.Mesh(
        new THREE.BoxGeometry(boardWidth, borderThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    bottomBorder.position.set(0, -boardHeight/2 + borderThickness/2, 0.001);
    boardGroup.add(bottomBorder);
    
    const leftBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, boardHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    leftBorder.position.set(-boardWidth/2 + borderThickness/2, 0, 0.001);
    boardGroup.add(leftBorder);
    
    const rightBorder = new THREE.Mesh(
        new THREE.BoxGeometry(borderThickness, boardHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    rightBorder.position.set(boardWidth/2 - borderThickness/2, 0, 0.001);
    boardGroup.add(rightBorder);
    

    const innerThickness = 0.008 * BOARD_SCALE; 
    const squareWidth = 0.61 * BOARD_SCALE; 
    const squareHeight = 0.457 * BOARD_SCALE; 
    
    const innerTop = new THREE.Mesh(
        new THREE.BoxGeometry(squareWidth, innerThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerTop.position.set(0, squareHeight/2, 0.002);
    boardGroup.add(innerTop);
    
    const innerBottom = new THREE.Mesh(
        new THREE.BoxGeometry(squareWidth, innerThickness, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerBottom.position.set(0, -squareHeight/2, 0.002);
    boardGroup.add(innerBottom);
    
    const innerLeft = new THREE.Mesh(
        new THREE.BoxGeometry(innerThickness, squareHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerLeft.position.set(-squareWidth/2, 0, 0.002);
    boardGroup.add(innerLeft);
    
    const innerRight = new THREE.Mesh(
        new THREE.BoxGeometry(innerThickness, squareHeight, 0.06),
        utils.MATERIALS.COURT_LINES
    );
    innerRight.position.set(squareWidth/2, 0, 0.002);
    boardGroup.add(innerRight);
    
    boardGroup.position.set(0, HOOP_HEIGHT - 0.5, -0.15);
    boardGroup.children.forEach(child => {
        child.castShadow = true;
        child.receiveShadow = true;
    });
    
    return boardGroup;
}

function createBasketballRim() {
    const rimGroup = new THREE.Group();
    
    const rimGeometry = new THREE.TorusGeometry(RIM_RADIUS, 0.04, 8, 50);
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6600 });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);

    const connectorLength = RIM_RADIUS / 2; 
    const connectorGeometry = new THREE.BoxGeometry(connectorLength, 0.04 * 2, 0.04 * 2);
    const connectorMaterial = new THREE.MeshPhongMaterial({ color: 0xFF6600 });
    const connector = new THREE.Mesh(connectorGeometry, connectorMaterial);
    
    const squareHeight = 0.457 * BOARD_SCALE;
    const backboardThickness = 0.05;

    const connectorY = HOOP_HEIGHT - 0.5 + (-squareHeight/2);
    const connectorZ = -0.15 + backboardThickness/2 + connectorLength/2;
    
    connector.position.set(0, connectorY, connectorZ);
    
    const rimY = connectorY;
    const rimZ = connectorZ + connectorLength/2 + RIM_RADIUS;
    
    rim.position.set(0, rimY, rimZ);
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;

    rimGroup.add(connector);
    rimGroup.add(rim);

    return rimGroup;
}

// function createBasketballNet() {
//     return;
// }

export { BasketballHoops };