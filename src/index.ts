// Interfaces
import {
  Vertex,
  PathData,
  Parameters,
  FrameVertex,
  Frame,
  GroupParameters,
  AnimateParameters,
  Keyframe
} from "./interfaces";

const round = (number: number): number => Math.round(number * 1e6) / 1e6;
const radToAngle = (rad: number): number => (rad * 180) / Math.PI;
const angleToRad = (angle: number): number => (angle * Math.PI) / 180;
const randomFromRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

/***********
 * Methods *
 ***********/

const setDefaults = (path: PathData): PathData => {
  defaults.parameters.numOfGroups = path.parameters.groups.length; // Set num of groups if not exist
  path.parameters = { ...defaults.parameters, ...path.parameters };

  path.parameters.groups = path.parameters.groups.map(group => ({
    ...defaults.parameters.groups,
    ...group
  }));
  return path;
};

const generateFrame = (parameters: Parameters): Frame => {
  const { depth, rotate, numOfSegments } = parameters;
  var numOfVertexes: number = numOfSegments * Math.pow(2, depth);
  var vertexes = [];
  for (let i = 0; i < numOfVertexes; i++) {
    let radians = ((Math.PI * 2) / numOfVertexes) * i;
    radians += angleToRad(rotate);
    let angle = radToAngle(radians);
    let cosx = round(Math.cos(radians));
    let siny = round(Math.sin(radians));
    let x = cosx;
    let y = siny;
    vertexes[i] = {
      cosx,
      siny,
      x,
      y,
      radians,
      angle
    };
  }
  var frameObj = {
    vertexes,
    numOfVertexes: vertexes.length
  };
  return frameObj;
};

const generateVertexes = (path: PathData): Vertex[] => {
  const { frame } = path;
  const { numOfGroups, numOfSegments } = path.parameters;
  const subdivisionDepth = numOfGroups - 1;
  const numOfPoints = numOfSegments * Math.pow(2, subdivisionDepth);
  var numOfVertexesPerSide = numOfPoints / frame.numOfVertexes;
  // Init root group from frame vertexes
  var vertexes: Vertex[] = frame.vertexes.map(vertex => ({
    ...vertex,
    type: "C",
    group: 0
  }));
  for (let group = 1; group < numOfGroups; group++) {
    var numOfNewVertexes = vertexes.length;
    for (let i = 1; i < numOfNewVertexes * 2; i += 2) {
      let protoVertex = {
        type: "C",
        group
      };
      vertexes.splice(i, 0, protoVertex); // Inser proto vertex in array
      let lastIndex = vertexes.length - 1;
      let prevVertexInd = i - 1;
      let nextVertexInd = i + 1;
      if (nextVertexInd > lastIndex) nextVertexInd = 0;
      // Calc X Y coords
      vertexes[i].x = vertexes[prevVertexInd].x - vertexes[nextVertexInd].x; // Substract adjacent points to get x
      vertexes[i].x *= 0.5; // Make x twice closer to center
      vertexes[i].x += vertexes[nextVertexInd].x; // Position x inbetween of adjacent points
      vertexes[i].y = vertexes[prevVertexInd].y - vertexes[nextVertexInd].y; // Make the same with Y
      vertexes[i].y *= 0.5;
      vertexes[i].y += vertexes[nextVertexInd].y;
      vertexes[i].radians = Math.atan2(vertexes[i].y, vertexes[i].x);
    }
  }

  return vertexes;
};

const remapVertexes = (vertexes: Vertex[]): Vertex[] => {
  /*
   * Add "M" vertex to the array at the start
   * Move first vertex to the end
   */

  var newArray = [];
  vertexes[vertexes.length] = vertexes[0];
  vertexes[0] = { ...vertexes[0], type: "M" };
  return vertexes;
};

const setControlPoints = (
  vertexes: Vertex[],
  groups: GroupParameters[]
): Vertex[] => {
  var numOfPoints = vertexes.length - 1; // Minus "M" vertex
  for (let i = 1; i < vertexes.length; i++) {
    // Set arms length factor
    let group = groups[vertexes[i].group];
    let prevGroup = groups[vertexes[i - 1].group];
    // Factor for first control point
    let prevFactor;
    if (prevGroup.roundPerVertex) prevFactor = prevGroup.roundPerVertex[i - 1];
    else if (prevGroup.roundRandomRange)
      prevFactor = randomFromRange(
        prevGroup.roundRandomRange[0],
        prevGroup.roundRandomRange[1]
      );
    else prevFactor = prevGroup.round;
    // Factor for second control point
    let factor;
    if (group.roundPerVertex) factor = group.roundPerVertex[i];
    else if (group.roundRandomRange)
      factor = randomFromRange(
        group.roundRandomRange[0],
        group.roundRandomRange[1]
      );
    else factor = group.round;
    // Set arms length
    let firstArmLength, secondArmLength;
    firstArmLength = secondArmLength =
      (4 / 3) * Math.tan(Math.PI / (2 * numOfPoints));
    firstArmLength *= prevFactor;
    secondArmLength *= factor;
    // Set arms angle
    let firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
    let firstArmAngle = radToAngle(firstArmRadians);
    let secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
    let secondArmAngle = radToAngle(secondArmRadians);
    // Set cos
    let cosx1 = round(Math.cos(firstArmRadians));
    let cosx2 = round(Math.cos(secondArmRadians));
    // Set sin
    let siny1 = round(Math.sin(firstArmRadians));
    let siny2 = round(Math.sin(secondArmRadians));
    // Set coordinates
    let x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
    let x2 = cosx2 * secondArmLength + vertexes[i].x;
    let y1 = siny1 * firstArmLength + vertexes[i - 1].y;
    let y2 = siny2 * secondArmLength + vertexes[i].y;
    vertexes[i] = {
      ...vertexes[i],
      x1,
      x2,
      y1,
      y2,
      cosx1,
      cosx2,
      siny1,
      siny2
    };
  }
  return vertexes;
};

const scaleToOne = (path: PathData): PathData => {
  var maxX = 0;
  var minX = 0;
  var maxY = 0;
  var minY = 0;
  path.vertexes.forEach(vertex => {
    if (vertex.x > maxX) maxX = vertex.x;
    if (vertex.x < minX) minX = vertex.x;
    if (vertex.y > maxY) maxY = vertex.y;
    if (vertex.y < minY) minY = vertex.y;
  });
  let factorX = 2 / (Math.abs(minX) + maxX);
  let factorY = 2 / (Math.abs(minY) + maxY);
  let shiftX = factorX * maxX - 1;
  let shiftY = factorY * maxY - 1;
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x = vertex.x * factorX - shiftX;
    vertex.y = vertex.y * factorY - shiftY;
    if (vertex.type === "C") {
      vertex.x1 = vertex.x1 * factorX - shiftX;
      vertex.x2 = vertex.x2 * factorX - shiftX;
      vertex.y1 = vertex.y1 * factorY - shiftY;
      vertex.y2 = vertex.y2 * factorY - shiftY;
    }
    return vertex;
  });
  return path;
};

const setCenter = (path: PathData): PathData => {
  const { parameters } = path;
  var factorX = 1 - parameters.centerX / (parameters.width / 2);
  var factorY = 1 - parameters.centerY / (parameters.height / 2);
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    if (vertex.type === "C") {
      vertex.x1 += factorX;
      vertex.x2 += factorX;
      vertex.y1 += factorY;
      vertex.y2 += factorY;
    }
    return vertex;
  });
  return path;
};

const setDistance = (path: PathData): PathData => {
  var distanceFactors: number[] = [];
  var { vertexes } = path;
  var { groups } = path.parameters;
  path.vertexes = path.vertexes.map((ver, i) => {
    // Calc factor
    var group = groups[ver.group];
    let factor;
    if (group.distancePerVertex) factor = group.distancePerVertex[i];
    else if (group.distanceRandomRange)
      factor = randomFromRange(
        group.distanceRandomRange[0],
        group.distanceRandomRange[1]
      );
    else factor = group.distance;

    factor = i === vertexes.length - 1 ? distanceFactors[0] : factor; // Set distance same as M for the last C
    distanceFactors[i] = factor;
    // Setup distance
    ver.x *= factor;
    ver.y *= factor;

    if (ver.type === "C") {
      // Calc factor
      let prevFactor = distanceFactors[i - 1];
      // Setup distance
      ver.x1 *= prevFactor;
      ver.y1 *= prevFactor;
      ver.x2 *= factor;
      ver.y2 *= factor;
    }
    return ver;
  });
  return path;
};

const setPosition = (path: PathData): PathData => {
  const { parameters } = path;
  var factorX = parameters.centerX / (parameters.width / 2);
  var factorY = parameters.centerY / (parameters.height / 2);
  path.frame.vertexes = path.frame.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    return vertex;
  });
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    if (vertex.type === "C") {
      vertex.x1 += factorX;
      vertex.y1 += factorY;
      vertex.x2 += factorX;
      vertex.y2 += factorY;
    }
    return vertex;
  });
  return path;
};

const setScale = (path: PathData): PathData => {
  const { parameters } = path;
  path.frame.vertexes = path.frame.vertexes.map(vertex => {
    vertex.x *= parameters.width / 2;
    vertex.y *= parameters.height / 2;
    return vertex;
  });
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x *= parameters.width / 2;
    vertex.y *= parameters.height / 2;
    if (vertex.type === "C") {
      vertex.x1 *= parameters.width / 2;
      vertex.y1 *= parameters.height / 2;
      vertex.x2 *= parameters.width / 2;
      vertex.y2 *= parameters.height / 2;
    }
    return vertex;
  });
  return path;
};

const calcLength = (path: PathData): PathData => {
  const { parameters } = path;
  path.vertexes = path.vertexes.map(vertex => {
    let x = vertex.x - parameters.centerX;
    let y = vertex.y - parameters.centerY;
    vertex.length = Math.sqrt(x * x + y * y);
    return vertex;
  });
  return path;
};

const setLength = (path: PathData): PathData => {
  const { parameters } = path;
  const { groups } = path.parameters;

  var lengthFactors: number[] = [];
  const calcFactor = (newRadius: number, radius: number): number => {
    if (newRadius === 0 || radius === 0) return 0;
    return newRadius / radius;
  };
  path.vertexes = path.vertexes.map((vertex, i) => {
    let group = groups[vertex.group];
    // Calc factor
    let factor;
    if (group.radiusPerVertex)
      factor = calcFactor(group.radiusPerVertex[i], vertex.length);
    else if (group.radiusRandomRange)
      factor = calcFactor(
        randomFromRange(group.radiusRandomRange[0], group.radiusRandomRange[1]),
        vertex.length
      );
    else if (group.radius) factor = calcFactor(group.radius, vertex.length);
    else factor = 1;
    lengthFactors[i] = factor;
    // Set length
    vertex.x = (vertex.x - parameters.centerX) * factor + parameters.centerX;
    vertex.y = (vertex.y - parameters.centerY) * factor + parameters.centerY;
    if (vertex.type === "C") {
      let prevFactor = lengthFactors[i - 1];
      vertex.x1 =
        (vertex.x1 - parameters.centerX) * prevFactor + parameters.centerX;
      vertex.y1 =
        (vertex.y1 - parameters.centerY) * prevFactor + parameters.centerY;
      vertex.x2 =
        (vertex.x2 - parameters.centerX) * factor + parameters.centerX;
      vertex.y2 =
        (vertex.y2 - parameters.centerY) * factor + parameters.centerY;
    }
    return vertex;
  });
  return path;
};

const setKeyframes = (path: PathData): PathData => {
  return path;
};

const shift = (path: PathData): PathData => {
  const { parameters } = path;
  // Apply x and y position parameters
  const { x, y } = parameters;
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += x;
    vertex.y += y;
    if (vertex.type === "C") {
      vertex.x1 += x;
      vertex.x2 += x;
      vertex.y1 += y;
      vertex.y2 += y;
    }
    return vertex;
  });
  return path;
};

const generateD = (path: PathData): PathData => {
  path.vertexes = path.vertexes.map(vertex => {
    switch (vertex.type) {
      case "M":
        vertex.d = `${vertex.type} ${vertex.x} ${vertex.y}`;
        break;
      case "C":
        vertex.d = `${vertex.type}\n${vertex.x1} ${vertex.y1},\n${vertex.x2} ${
          vertex.y2
        },\n${vertex.x} ${vertex.y}`;
        break;
      default:
        vertex.d = ``;
    }
    return vertex;
  });
  var svgPathData = "";
  path.vertexes.forEach((vertex, i) => {
    svgPathData += "\n\n" + vertex.d;
  });
  svgPathData += "\n\nZ";
  path.svgPathData = svgPathData;
  return path;
};

const generateSVGPathData = (path: PathData): PathData => {
  var array = [];
  path.vertexes.forEach((vertex, index) => {
    if (index === 0) {
      array[path.vertexes.length] = vertex;
    }
  });
  path.svgPathData;
  return path;
};

/********
 * Root *
 ********/

const generateShape = (
  parameters: Parameters = defaults.parameters
): PathData => {
  // Setup defaults
  var path: PathData = { parameters };
  path = setDefaults(path);

  // Generate shape
  path.frame = generateFrame(path.parameters);
  path.vertexes = generateVertexes(path);
  path.vertexes = remapVertexes(path.vertexes); // Add M point
  path.vertexes = setControlPoints(path.vertexes, path.parameters.groups);

  if (!parameters.incircle) path = scaleToOne(path);
  path = setCenter(path);
  path = setDistance(path);
  path = setPosition(path);
  path = setScale(path);
  path = calcLength(path);
  path = setLength(path);
  path = setKeyframes(path);
  path = shift(path);
  path = generateD(path);
  return path;
};

var defaults = {
  parameters: {
    numOfSegments: 4,
    depth: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    centerX: 50,
    centerY: 50,
    rotate: 0,
    numOfGroups: 1,
    incircle: false,
    groups: [
      {
        round: 0.5,
        distance: 1
      }
    ]
  }
};

export default generateShape;
