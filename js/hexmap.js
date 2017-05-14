var raycaster, scene, renderer, camera;
var mouse = new THREE.Vector2();

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
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.sortObjects = false;

  document.getElementById("mapcontainer").appendChild(renderer.domElement);

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

  camera.position.z = 70;

  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = document.getElementById("mapcontainer").offsetWidth / document.getElementById("mapcontainer").offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.getElementById("mapcontainer").offsetWidth, document.getElementById("mapcontainer").offsetHeight, false);
  }

  const controls = new THREE.OrbitControls(camera)
  controls.target = new THREE.Vector3(0,10,0)
  camera.lookAt(new THREE.Vector3(0,10,0))

  raycaster = new THREE.Raycaster();
  document.addEventListener("mousemove", onDocumentMouseMove);
  function onDocumentMouseMove(event) {
    const boundingBox = document.getElementById("mapcontainer").firstChild.getBoundingClientRect()
    event.preventDefault();
    mouse.x = (event.clientX - boundingBox.left) / document.getElementById("mapcontainer").firstChild.offsetWidth * 2 - 1;
    mouse.y = -((event.clientY-boundingBox.top) / (document.getElementById("mapcontainer").firstChild.offsetHeight + 2)) * 2 + 1;
  }

    animate();
  }

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    TWEEN.update();
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children, true);
    for ( var i = 0; i < intersects.length; i++ ) {
      hoverCallback(intersects[0].object.userData.cstyid)
    }

    renderer.render( scene, camera );
    camera.aspect = document.getElementById("mapcontainer").offsetWidth / document.getElementById("mapcontainer").offsetHeight;
    camera.updateProjectionMatrix();
}

function tweenHexagonalPrism(hexObject, newHeight) {
  new TWEEN.Tween({ x: hexObject.children[1].position.z })
    .to({ x: newHeight }, 5000)
    .onUpdate(function() {

      const topHex = hexObject.children[1]
      topHex.position.setZ(this.x)

      const sides = hexObject.children[2].children

      for(var i =0; i<6; i++) {
        sides[i].geometry.vertices[0].setY(this.x)
        sides[i].geometry.vertices[1].setY(this.x)
        sides[i].geometry.verticesNeedUpdate = true
      }
    })
    .start();
}

function tweenExplodeMap(hexObject) {
    new TWEEN.Tween({ x: hexObject.position.x, y: hexObject.position.y })
    .to({ x: hexObject.userData.originX * 20, y: hexObject.userData.originY * 20 }, 3000)
    .onUpdate(function() {
      hexObject.position.x = this.x
      hexObject.position.y = this.y
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();
}

function setHeight(height = 0) {
  var tween = x => {
    if(x.type != "PointLight") {tweenHexagonalPrism(x,height)};
  }
  R.forEach(tween, scene.children);
}

function explodeHexMap() {
  var tween = x => {
    if(x.type != "PointLight") {tweenExplodeMap(x,0)};
  }
  R.forEach(tween, scene.children);
}

function tweenRectangleMap(hexObject, count) {
    const targetX = count / 25 * 2 - 25
    const targetY = count % 25 * 2 - 25

    new TWEEN.Tween({ x: hexObject.position.x, y: hexObject.position.y })
    .to({ x: targetX, y: targetY }, 3000)
    .onUpdate(function() {
      hexObject.position.x = this.x
      hexObject.position.y = this.y
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();
}

function rectangleHexMap() {
  var count = 0;
  var tween = x => {
    if(x.type != "PointLight") {
      count = count + 1
      tweenRectangleMap(x, count)};
  }

  const sortByParty = R.sortWith([
    R.descend(R.path(["userData", "first_party"])),
    R.descend(R.compose(x => parseInt(x), R.path(["userData", "majority"])))
  ]);
  R.forEach(tween, sortByParty(scene.children));
}

function tweenNewVis(hexObject, heightFunc, positionFunc) {

  const targetX = positionFunc(hexObject.userData).x
  const targetY = positionFunc(hexObject.userData).y

  new TWEEN.Tween({ x: hexObject.position.x, y: hexObject.position.y, height: hexObject.children[1].position.z })
    .to({ x: targetX, y: targetY, height: heightFunc(hexObject.userData) }, 1000)
    .onUpdate(function() {
      hexObject.position.x = this.x
      hexObject.position.y = this.y
      const topHex = hexObject.children[1]
      topHex.position.setZ(this.height)

      const sides = hexObject.children[2].children

      for(var i =0; i<6; i++) {
        sides[i].geometry.vertices[0].setY(this.height)
        sides[i].geometry.vertices[1].setY(this.height)
        sides[i].geometry.verticesNeedUpdate = true
      }
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();

}

function tweenColor(hexObject, colorFunc) {
  new TWEEN.Tween(hexObject.children[1].material.color)
    .to(colorFunc(hexObject.userData), 1000)
    .onUpdate(function() {
      const newColor = {r: this.r, g: this.g, b: this.b}
      hexObject.children[1].material.color.copy(newColor)
      // TODO Clean up
      hexObject.children[2].children[0].material.color.copy(newColor)
      hexObject.children[2].children[1].material.color.copy(newColor)
      hexObject.children[2].children[2].material.color.copy(newColor)
      hexObject.children[2].children[3].material.color.copy(newColor)
      hexObject.children[2].children[4].material.color.copy(newColor)
      hexObject.children[2].children[5].material.color.copy(newColor)
    })
    .easing(TWEEN.Easing.Exponential.InOut)
    .start();
}

function animateTo(colorFunc, heightFunc, positionFunc) {
  const tween = object => {
    if(object.type != "PointLight") {
      tweenNewVis(object, heightFunc, positionFunc)
      tweenColor(object, colorFunc)
    };
  }
  R.forEach(tween, scene.children);
}