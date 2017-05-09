var fs = require("fs");
var R = require("ramda");

const objectA = JSON.parse(fs.readFileSync(process.argv[2]).toString());
const objectB = JSON.parse(fs.readFileSync(process.argv[3]).toString());

function combineObjects(a, b) {
  const combine = (value, key) => a[key] = Object.assign(a[key], b[key]);
  R.forEachObjIndexed(combine, a);
  return a;
}

const combinedData = combineObjects(objectA, objectB);

const extractCoordinates = function(i, key, obj) {
  const iWithoutQorR = R.omit(["q", "r"], i);
  return Object.assign({ id: key, x: i.q, y: i.r }, iWithoutQorR);
};

const list = R.values(R.mapObjIndexed(extractCoordinates, combinedData));

fs.writeFileSync('combined.json', JSON.stringify(list));