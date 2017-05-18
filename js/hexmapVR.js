if ( WEBVR.isAvailable() === false ) {
    document.body.appendChild( WEBVR.getMessage() );
}

var raycaster, scene, renderer, camera, controls;
var mouse = new THREE.Vector2();
var effect;
var container;

function generateHexagon(height, radius, color, opacity, cstyid) {
  const pts = [];
  pts.push(new THREE.Vector3(0, radius, 0));
  pts.push(new THREE.Vector3(radius * 0.866, radius * 0.5, 0));
  pts.push(new THREE.Vector3(radius * 0.866, -radius * 0.5, 0));
  pts.push(new THREE.Vector3(0, -radius, 0));
  pts.push(new THREE.Vector3(-radius * 0.866, -radius * 0.5, 0));
  pts.push(new THREE.Vector3(-radius * 0.866, +radius * 0.5, 0));
  const hex = new THREE.Shape(pts);
  const geometry = new THREE.ShapeGeometry(hex);
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: false,
    opacity,
    transparent: true
  });
  material.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.setZ(height);
  mesh.userData = { cstyid }
  return mesh;
}

function generateSide(rotX, rotY, posX, posY, width, height, color, opacity, cstyid) {
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.vertices[0].set(-width/2, height, 0);
  geometry.vertices[1].set(width/2, height, 0);
  geometry.vertices[2].set(-width/2, 0, 0);
  geometry.vertices[3].set(width/2, 0, 0);
  geometry.verticesNeedUpdate=true;
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    wireframe: false,
    opacity,
    transparent: true
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = rotX;
  mesh.rotation.y = rotY;
  mesh.position.setX(posX);
  mesh.position.setY(posY);
  mesh.position.setZ(0);
  mesh.userData = { cstyid }
  return mesh;
}

function generateHexagonSides(x, y, height, color, opacity, cstyid) {
  const group = new THREE.Object3D();

  const side1 = generateSide(
    Math.PI / 2,
    Math.PI / 2,
    0.866,
    0,
    1,
    height,
    color,
    opacity,
    cstyid
  );

  group.add(side1);

  const side2 = generateSide(
    Math.PI / 2,
    Math.PI / 2,
    -0.866,
    0,
    1,
    height,
    color,
    opacity,
    cstyid
  );

  group.add(side2);

  const side3 = generateSide(
    Math.PI / 2,
    -Math.PI / 6,
    0.866 / 2,
    0.75,
    1,
    height,
    color,
    opacity,
    cstyid
  );

  group.add(side3);

  const side4 = generateSide(
    Math.PI / 2,
    Math.PI / 6,
    -0.866 / 2,
    0.75,
    1,
    height,
    color,
    opacity,
    cstyid
  );

  group.add(side4);

  const side5 = generateSide(
    Math.PI / 2,
    Math.PI / 6,
    0.866 / 2,
    -0.75,
    1,
    height,
    color,
    opacity,
    cstyid
  );

  group.add(side5);

  const side6 = generateSide(
    Math.PI / 2,
    -Math.PI / 6,
    -0.866 / 2,
    -0.75,
    1,
    height,
    color,
    opacity,
    cstyid
  );

  group.add(side6);

  return group;
}

function generateHexagonalPrism(x, y, height, color, opacity, cstyid) {
  const group = new THREE.Object3D();
  const bottomHex = generateHexagon(0, 1, 0x000000, 0, cstyid);
  group.add(bottomHex);
  const topHex = generateHexagon(height, 1, color, 0.8, cstyid);
  group.add(topHex);
  const sides = generateHexagonSides(x, y, height, color, 0.1, cstyid);
  group.add(sides);
  return group;
}

function generateHexMap(data, colorFunc, heightFunc, opacityFunc, hoverCallback) {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    10
  );

  camera.position.set(0, 0, 50);

  scene.add(camera)

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.sortObjects = false;
  container.appendChild( renderer.domElement);

  controls = new THREE.VRControls( camera );
  effect = new THREE.VREffect( renderer );


  
    
  WEBVR.getVRDisplay( function ( display ) {
    document.body.appendChild( WEBVR.getButton( display, renderer.domElement ) );
  } );

  const drawHexObject = (value, key) => {
      var x = value.x;
      var y = value.y;

      const separator = 2;

      if (y % 2 == 0) {
        x = x * separator;
        y = y * separator * 0.866;
      } else {
        x = x * separator + separator / 2;
        y = y * separator * 0.866;
      }

      const hexGroup = generateHexagonalPrism(
        x,
        y,
        heightFunc(value),
        colorFunc(value),
        opacityFunc(value),
        key
      );

      hexGroup.translateX(x);
      hexGroup.translateY(y);
      hexGroup.userData = value
      hexGroup.userData.originX = hexGroup.position.x
      hexGroup.userData.originY = hexGroup.position.y
      scene.add(hexGroup);
  };

  R.forEachObjIndexed(drawHexObject, data);
  for(var i = 0; i< scene.children.length; i++) {
    scene.children[i].userData.sortOrder = i
  }

  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    effect.setSize( window.innerWidth, window.innerHeight );
  }

    animate(hoverCallback);
  }

function animate() {
    requestAnimationFrame(animate);
    render(hoverCallback);
}

function render(hoverCallback) {

    renderer.render( scene, camera );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    controls.update();
    effect.render( scene, camera ); 

}