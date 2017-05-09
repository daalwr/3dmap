function generateHexagon(x, y, z, radius, color, opacity) {
  var pts = [];
  pts.push(new THREE.Vector3(0, radius, 0));
  pts.push(new THREE.Vector3(radius * 0.866, radius * 0.5, 0));
  pts.push(new THREE.Vector3(radius * 0.866, -radius * 0.5, 0));
  pts.push(new THREE.Vector3(0, -radius, 0));
  pts.push(new THREE.Vector3(-radius * 0.866, -radius * 0.5, 0));
  pts.push(new THREE.Vector3(-radius * 0.866, +radius * 0.5, 0));
  var hex = new THREE.Shape(pts);
  geometry = new THREE.ShapeGeometry(hex);
  material = new THREE.MeshLambertMaterial({
    color,
    wireframe: false,
    opacity,
    transparent: true
  });
  material.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  return mesh;
}

function generateSide(rotX, rotY, posX, posY, width, height, color, opacity) {
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
  return mesh;
}

function generateHexagonSides(x, y, height, color, opacity) {
  var group = new THREE.Object3D();

  const side1 = generateSide(
    Math.PI / 2,
    Math.PI / 2,
    0.866,
    0,
    1,
    height,
    color,
    opacity
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
    opacity
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
    opacity
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
    opacity
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
    opacity
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
    opacity
  );

  group.add(side6);

  group.translateX(x);
  group.translateY(y);

  return group;
}

function generateHexagonalPrism(x, y, height, color, opacity) {
  var group = new THREE.Object3D();

  const topHex = generateHexagon(x, y, 0, 1, color, opacity);
  group.add(topHex);
  const bottomHex = generateHexagon(x, y, height, 1, color, opacity);
  group.add(bottomHex);

  const sides = generateHexagonSides(x, y, height, color, opacity);
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

    const hexGroup = generateHexagonalPrism(x, y, heightFunc(data[i]), colorFunc(data[i]), opacityFunc(data[i]));
    scene.add(hexGroup);
  }

  camera.position.z = 50;
  camera.position.y = 10;

  var controls = new THREE.OrbitControls(camera);

  var light = new THREE.PointLight(0xffffff, 1, 1000);
  light.position.set(0, 0, 100);
  scene.add(light);

  var render = function() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  };

  render();
}


