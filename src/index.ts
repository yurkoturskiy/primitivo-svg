import * as log from "loglevel";

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
  defaultParameters.numOfGroups = path.parameters.groups.length; // Set num of groups if not exist
  path.parameters = { ...defaultParameters, ...path.parameters };

  path.parameters.groups = path.parameters.groups.map(group => ({
    ...defaultParameters.groups[0],
    ...group
  }));
  return path;
};

const generateFrame = (path: PathData): PathData => {
  /*
   * Generate frame which is the base for a path and
   * serve as the base for a 0-group vertexes.
   */

  const { depth, rotate, numOfSegments, groups } = path.parameters;
  var numOfVertexes: number = numOfSegments * Math.pow(2, depth);
  var vertexes = [];
  for (let i = 0; i < numOfVertexes; i++) {
    let radians: number;
    // If custom radians were provided
    if (groups[0].radians) radians = groups[0].radians[i];
    // Generate own if not
    else radians = ((Math.PI * 2) / numOfVertexes) * i;
    // Rotate
    radians = radians + angleToRad(rotate);

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
  path.frame = {
    vertexes,
    numOfVertexes: vertexes.length
  };
  return path;
};

const parseGroupParameter = (
  parameter: any,
  group: GroupParameters,
  vertexIndex: number
): number => {
  /* Parse distance, round, or radius group parameters */

  // Number for all
  if (typeof parameter === "number") return parameter;
  // Random for all
  if (typeof parameter === "object" && parameter.length === 2)
    return randomFromRange(parameter[0], parameter[1]);
  // Distance per vertex
  if (typeof parameter === "object") {
    parameter = parameter[vertexIndex];
    // Number
    if (typeof parameter === "number") return parameter;
    // Random range
    if (typeof parameter === "object" && parameter.length === 2)
      return randomFromRange(parameter[0], parameter[1]);
  }
  return parameter;
};

const getRoundValue = (group: GroupParameters, vertexIndex: number): number => {
  /* Get round value for a vertex from given group parameters */
  let parameter: any = group.round;
  parameter = parseGroupParameter(parameter, group, vertexIndex);
  if (typeof parameter !== "number")
    throw `Wrong 'round' parameters in group number ${group.pk}`;
  else return parameter;
};

const getDistanceValue = (
  group: GroupParameters,
  vertexIndex: number
): number => {
  /* Get distance value for a vertex from given group parameters */
  let parameter: any = group.distance;
  parameter = parseGroupParameter(parameter, group, vertexIndex);
  if (typeof parameter !== "number")
    throw `Wrong 'distance' parameters in group number ${group.pk}`;
  else return parameter;
};

const getRadiusValue = (
  group: GroupParameters,
  vertexIndex: number
): number => {
  /* Get radius value for a vertex from given group parameters */
  let parameter: any = group.radius;
  parameter = parseGroupParameter(parameter, group, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "number")
    throw `Wrong 'radius' parameters in group number ${group.pk}`;
  else return parameter;
};

const generateVertexes = (path: PathData): PathData => {
  log.info("generate vertexes");
  const { frame } = path;
  const { numOfGroups, numOfSegments, groups } = path.parameters;
  const subdivisionDepth = numOfGroups - 1;
  const numOfPoints = numOfSegments * Math.pow(2, subdivisionDepth);
  var numOfVertexesPerSide = numOfPoints / frame.numOfVertexes;
  // Init root group from frame vertexes
  groups[0].numOfVertexes = frame.numOfVertexes;
  groups[0].pk = 0;
  var vertexes: Vertex[] = frame.vertexes.map((vertex, index) => ({
    ...vertex,
    type: "C",
    group: 0,
    round: getRoundValue(groups[0], index),
    distance: getDistanceValue(groups[0], index),
    radius: getRadiusValue(groups[0], index)
  }));
  for (let groupIndex = 1; groupIndex < numOfGroups; groupIndex++) {
    log.debug("group number", groupIndex);
    var numOfNewVertexes = vertexes.length;
    log.debug("number of vertexes", numOfNewVertexes);
    groups[groupIndex].numOfVertexes = numOfNewVertexes;
    groups[groupIndex].pk = groupIndex;
    for (let i = 1; i < numOfNewVertexes * 2; i += 2) {
      let protoVertex = {
        type: "C",
        group: groupIndex
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
      vertexes[i].angle = radToAngle(vertexes[i].radians);
      // Set distance, round, and radius values per vertex
      let indexWithingGroup = (i - 1) / 2;
      log.debug("vertex index withing a group", indexWithingGroup);
      vertexes[i].distance = getDistanceValue(
        groups[groupIndex],
        indexWithingGroup
      );
      vertexes[i].round = getRoundValue(groups[groupIndex], indexWithingGroup);
      vertexes[i].radius = getRadiusValue(
        groups[groupIndex],
        indexWithingGroup
      );
    }
  }
  path.vertexes = vertexes;
  return path;
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
    return vertex;
  });
  return path;
};

const setDistance = (path: PathData): PathData => {
  var { vertexes } = path;
  var { groups } = path.parameters;
  path.vertexes = path.vertexes.map((vertex, index) => {
    // Setup distance
    vertex.x *= vertex.distance;
    vertex.y *= vertex.distance;
    return vertex;
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
  log.info("set length");
  const { parameters, vertexes } = path;
  const { groups } = path.parameters;

  const calcFactor = (newRadius: number, radius: number): number => {
    if (newRadius === 0 || radius === 0) return 0;
    return newRadius / radius;
  };
  path.vertexes = vertexes.map((vertex, i) => {
    let group = groups[vertex.group];
    // Calc factor
    let factor = vertex.radius ? calcFactor(vertex.radius, vertex.length) : 1;
    // Set length
    vertex.x = (vertex.x - parameters.centerX) * factor + parameters.centerX;
    vertex.y = (vertex.y - parameters.centerY) * factor + parameters.centerY;
    return vertex;
  });
  log.debug(path);
  return path;
};

const calcRadians = (path: PathData): PathData => {
  log.info("calculate radians");
  const { vertexes } = path;
  const { centerX, centerY } = path.parameters;
  path.vertexes = vertexes.map(vertex => {
    let deltaX = vertex.x - centerX;
    let deltaY = centerY - vertex.y;
    vertex.radians = Math.atan2(deltaY, deltaX);
    vertex.angle = radToAngle(vertex.radians);
    return vertex;
  });
  return path;
};

const setControlPoints = (path: PathData): PathData => {
  var { vertexes } = path;
  var { groups } = path.parameters;
  var numOfPoints = vertexes.length - 1; // Minus "M" vertex
  var firstArmFactors: number[] = [];
  var secondArmFactors: number[] = [];
  for (let i = 1; i < vertexes.length; i++) {
    // Set arms length
    let firstArmLength, secondArmLength;
    let firstArmRoundMode = groups[vertexes[i - 1].group].roundMode;
    let secondArmRoundMode = groups[vertexes[i].group].roundMode;

    let individualFactor;
    if (
      firstArmRoundMode === "individual" ||
      secondArmRoundMode === "individual"
    ) {
      let radiansDelta = Math.abs(
        vertexes[i - 1].radians - vertexes[i].radians
      );
      if (radiansDelta > Math.PI) radiansDelta = 2 * Math.PI - radiansDelta;
      individualFactor = (2 * Math.PI) / radiansDelta;
    }

    let firstArmFactor =
      firstArmRoundMode === "individual" ? individualFactor : numOfPoints;

    let secondArmFactor =
      secondArmRoundMode === "individual" ? individualFactor : numOfPoints;

    firstArmLength = (4 / 3) * Math.tan(Math.PI / (2 * firstArmFactor));
    firstArmLength *= vertexes[i - 1].length;
    secondArmLength = (4 / 3) * Math.tan(Math.PI / (2 * secondArmFactor));
    secondArmLength *= vertexes[i].length;
    firstArmLength *= vertexes[i - 1].round;
    secondArmLength *= vertexes[i].round;
    // Set arms angle
    let firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
    let firstArmAngle = radToAngle(firstArmRadians);
    log.debug("first arm angle", firstArmAngle);
    let secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
    let secondArmAngle = radToAngle(secondArmRadians);
    log.debug("second arm angle", secondArmAngle);
    // Set cos
    let cosx1 = round(Math.cos(firstArmRadians)) * -1;
    let cosx2 = round(Math.cos(secondArmRadians)) * -1;
    // Set sin
    let siny1 = round(Math.sin(firstArmRadians));
    let siny2 = round(Math.sin(secondArmRadians));
    // Set coordinates
    let x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
    let x2 = cosx2 * secondArmLength + vertexes[i].x;
    let y1 = siny1 * firstArmLength + vertexes[i - 1].y;
    let y2 = siny2 * secondArmLength + vertexes[i].y;
    log.debug(`vertex ${i} first arm x: ${x1} y: ${y1}`);
    log.debug(`vertex ${i} second arm x: ${x2} y: ${y2}`);
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
  parameters: Parameters = defaultParameters
): PathData => {
  // Setup defaults
  var path: PathData = { parameters };
  path = setDefaults(path);

  // Generate shape
  path = generateFrame(path);
  path = generateVertexes(path);
  path.vertexes = remapVertexes(path.vertexes); // Add M point

  if (!parameters.incircle) path = scaleToOne(path);
  path = setCenter(path);
  path = setDistance(path);
  path = setPosition(path);
  path = setScale(path);
  path = calcLength(path);
  path = setLength(path);
  path = calcLength(path);
  path = calcRadians(path);
  path = setControlPoints(path);
  path = shift(path);
  path = generateD(path);
  return path;
};

var defaultParameters = {
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
      distance: 1,
      roundMode: "general"
    }
  ]
};

export default generateShape;
