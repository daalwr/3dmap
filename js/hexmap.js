var raycaster;
var mouse = new THREE.Vector2();

function generateHexagon(x, y, z, radius, color, opacity, cstyid) {
  var pts = [];
  pts.push(new THREE.Vector3(0, radius, 0));
  pts.push(new THREE.Vector3(radius * 0.866, radius * 0.5, 0));
  pts.push(new THREE.Vector3(radius * 0.866, -radius * 0.5, 0));
  pts.push(new THREE.Vector3(0, -radius, 0));
  pts.push(new THREE.Vector3(-radius * 0.866, -radius * 0.5, 0));
  pts.push(new THREE.Vector3(-radius * 0.866, +radius * 0.5, 0));
  var hex = new THREE.Shape(pts);
  geometry = new THREE.ShapeGeometry(hex);
  material = new THREE.MeshBasicMaterial({
    color,
    wireframe: false,
    opacity,
    transparent: true
  });
  material.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.userData = { cstyid }
  return mesh;
}

function generateSide(rotX, rotY, posX, posY, width, height, color, opacity, cstyid) {
  var geometry = new THREE.PlaneGeometry(width, height);
  var material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
    wireframe: false,
    opacity,
    transparent: true
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = rotX;
  mesh.rotation.y = rotY;
  mesh.position.setX(posX);
  mesh.position.setY(posY);
  mesh.position.setZ(height / 2);
  mesh.userData = { cstyid }
  return mesh;
}

function generateHexagonSides(x, y, height, color, opacity, cstyid) {
  var group = new THREE.Object3D();

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

  group.translateX(x);
  group.translateY(y);

  return group;
}

function generateHexagonalPrism(x, y, height, color, opacity, cstyid) {
  var group = new THREE.Object3D();

  const bottomHex = generateHexagon(x, y, 0, 1, color, 0, cstyid);
  group.add(bottomHex);
  const topHex = generateHexagon(x, y, height, 1, color, 0.8, cstyid);
  group.add(topHex);

  const sides = generateHexagonSides(x, y, height, color, 0.2, cstyid);
  group.add(sides);

  return group;
}

function generateHexMap(data, colorFunc, heightFunc, opacityFunc) {
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);
  var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);

  for (i = 0; i < data.length; i++) {
    var x = data[i].x;
    var y = data[i].y;

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
      heightFunc(data[i]),
      colorFunc(data[i]),
      opacityFunc(data[i]),
      data[i].id
    );
    scene.add(hexGroup);
  }

  camera.position.z = 50;
  camera.position.y = 10;

  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  var controls = new THREE.OrbitControls(camera);

  var light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(0, 0, 100);
  scene.add(light);

  raycaster = new THREE.Raycaster();
  document.addEventListener("mousemove", onDocumentMouseMove, false);

  function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = event.clientX / window.innerWidth * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  var render = function() {
    requestAnimationFrame(render);


	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children, true);

	// for ( var i = 0; i < intersects.length; i++ ) {
  //   console.log(intersects[0].object.userData)
  //   $("#cstyid").text(intersects[0].object.userData.cstyid)
	// }

	renderer.render( scene, camera );
  };

  render();
}
