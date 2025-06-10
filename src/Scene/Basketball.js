// Import * Three from 'THREE';


// Create Ball
function Basketball() {
    const ballGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    
    const textureLoader = new THREE.TextureLoader();
    const basketballTexture = textureLoader.load('src/Scene/pics/basketball.png');
    
    // Configure texture
    basketballTexture.wrapS = THREE.RepeatWrapping;
    basketballTexture.wrapT = THREE.RepeatWrapping;
    
    const ballMaterial = new THREE.MeshLambertMaterial({
        map: basketballTexture
    });
    
    const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
    basketball.position.set(0, 0.6, 0);
    basketball.castShadow = true;
    basketball.receiveShadow = true;
    
    return basketball;
}



export { Basketball };