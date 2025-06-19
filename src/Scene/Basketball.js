// Import * Three from 'THREE';


// Create Ball
function Basketball() {
    const radius = 0.6
    const ballGeometry = new THREE.SphereGeometry(radius, 32, 32);

    const textureLoader = new THREE.TextureLoader();
    const basketballTexture = textureLoader.load('src/Scene/textures/basketball.png');

    // Configure texture
    basketballTexture.wrapS = THREE.RepeatWrapping;
    basketballTexture.wrapT = THREE.RepeatWrapping;

    const ballMaterial = new THREE.MeshLambertMaterial({
        map: basketballTexture
    });

    const basketball = new THREE.Mesh(ballGeometry, ballMaterial);
    basketball.castShadow = true;
    basketball.receiveShadow = true;

    return {
        object: basketball,
        baseHeight: radius
    };
}



export { Basketball };