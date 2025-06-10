
const POLE_HEIGHT = 10;
const POLE_RADIUS = 0.1;
const POLE_POSITION = { x: 0, y: POLE_HEIGHT / 2, z: -1.5 };

function BasketballHoops(scene) {  
    
    const hoop = new THREE.Group();

    const pole = createBasketballPole();
    const board = createBasketballBoard();
    const supportArm = createSupportArm();

    hoop.add(pole, board, supportArm);
    return hoop;
}

function createBasketballPole() {
        const poleGeometry = new THREE.CylinderGeometry(POLE_RADIUS, POLE_RADIUS, POLE_HEIGHT, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x4169E1});
        
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        
        pole.position.set(POLE_POSITION.x, POLE_POSITION.y, POLE_POSITION.z);
        pole.castShadow = true;
        pole.receiveShadow = true;
        return pole;
}

function createBasketballBoard(){
    const backboardGeometry = new THREE.BoxGeometry(1.8, 1.05, 0.05);
    const backboardMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        transparent: true,
        opacity: 0.9 
    });
    const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
    const backboardPosition = {
        x: POLE_POSITION.x,
        y: POLE_POSITION.y + 4.5,
        z: POLE_POSITION.z + 1.5
    };
    backboard.position.set(backboardPosition.x, backboardPosition.y, backboardPosition.z);
    backboard.castShadow = true;
    backboard.receiveShadow = true;
    return backboard;
}

function createSupportArm() {
    const armGeometry = new THREE.BoxGeometry(0.15, 0.15, 1.8);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0x4169E1 });
    const arm = new THREE.Mesh(armGeometry, armMaterial);
        
    const armPosition = {
            x: POLE_POSITION.x,
            y: POLE_POSITION.y + 4.5, 
            z: POLE_POSITION.z + 0.9 
        };
    arm.position.set(armPosition.x, armPosition.y, armPosition.z);
    arm.castShadow = true;
    return arm;
}



export { BasketballHoops };