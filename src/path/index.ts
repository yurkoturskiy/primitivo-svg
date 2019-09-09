import {
  round,
  radToAngle,
  angleToRad,
  randomRange,
  radiansDelta,
  getType
} from "../misc/index";

// Interfaces
import {
  Vertex,
  PathData,
  InputParameters,
  FrameVertex,
  Frame,
  GroupParameters,
  Keyframe
} from "./interfaces";

// Logging
var log = require("loglevel").getLogger("path-log");

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
    if (groups[0].radians) radians = getRadiansValue(groups[0], i);
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

const parseGroupParameter = (parameter: any, vertexIndex: number): number => {
  /* Parse distance, round, or radius group parameters */

  // Number for all
  if (typeof parameter !== "object") return parameter;
  // Random for all
  if (typeof parameter === "object" && parameter.length === 2)
    return randomRange(parameter[0], parameter[1]);
  // Distance per vertex
  if (typeof parameter === "object") {
    parameter = parameter[vertexIndex];
    // Number
    if (typeof parameter !== "object") return parameter;
    // Random range
    if (typeof parameter === "object" && parameter.length === 2)
      return randomRange(parameter[0], parameter[1]);
  }
  return parameter;
};

const getRoundValue = (group: GroupParameters, vertexIndex: number): number => {
  /* Get round value for a vertex from given group parameters */
  let parameter: any = group.round;
  parameter = parseGroupParameter(parameter, vertexIndex);
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
  parameter = parseGroupParameter(parameter, vertexIndex);
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
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "number")
    throw `Wrong 'radius' parameters in group number ${group.pk}`;
  else return parameter;
};

const getTypeValue = (group: GroupParameters, vertexIndex: number): string => {
  let parameter: any = group.type;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "string")
    throw `Wrong 'type' parameter in group number ${group.pk}`;
  else return parameter;
};

const getSmartRoundValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.smartRound;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'smartRound' parameter in group number ${group.pk}`;
  else return parameter;
};

const getLengthBasedRoundValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.lengthBasedRound;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'lengthBasedRound' parameter in group number ${group.pk}`;
  else return parameter;
};

const getAdaptArmsValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.adaptArms;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'adaptArms' parameter in group number ${group.pk}`;
  else return parameter;
};

const getRadiansValue = (
  group: GroupParameters,
  vertexIndex: number
): number => {
  let parameter: any = group.radians;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "number")
    throw `Wrong 'radians' parameter in group number ${group.pk}`;
  else return parameter;
};

const generateLinearVertexCoordinates = (
  vertexes: Vertex[],
  vertex: Vertex,
  prevVertex: Vertex,
  nextVertex: Vertex
): Vertex => {
  // Calc X Y coords
  vertex.x = prevVertex.x - nextVertex.x; // Substract adjacent points to get x
  vertex.x *= 0.5; // Make x twice closer to center
  vertex.x += nextVertex.x; // Position x inbetween of adjacent points
  vertex.y = prevVertex.y - nextVertex.y; // Make the same with Y
  vertex.y *= 0.5;
  vertex.y += nextVertex.y;
  vertex.radians = Math.atan2(vertex.y, vertex.x);
  vertex.angle = radToAngle(vertex.radians);
  return vertex;
};

const generateRadialVertexCoordinates = (
  vertexes: Vertex[],
  vertex: Vertex,
  prevVertex: Vertex,
  nextVertex: Vertex
): Vertex => {
  let radiansStep = radiansDelta(nextVertex.radians, prevVertex.radians) / 2;
  vertex.radians = prevVertex.radians + radiansStep;
  vertex.cosx = round(Math.cos(vertex.radians));
  vertex.siny = round(Math.sin(vertex.radians));
  vertex.x = vertex.cosx;
  vertex.y = vertex.siny;
  return vertex;
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
    indexWithingGroup: index,
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
      let indexWithingGroup = (i - 1) / 2;
      let protoVertex = {
        type: "C",
        group: groupIndex
      };
      vertexes.splice(i, 0, protoVertex); // Inser proto vertex in array
      let lastIndex = vertexes.length - 1;
      let prevVertexInd = i - 1;
      let nextVertexInd = i + 1;
      if (nextVertexInd > lastIndex) nextVertexInd = 0;

      let vertex = vertexes[i];
      let prevVertex = vertexes[prevVertexInd];
      let nextVertex = vertexes[nextVertexInd];
      let vertexType = getTypeValue(groups[groupIndex], indexWithingGroup);
      switch (vertexType) {
        case "linear":
          vertex = generateLinearVertexCoordinates(
            vertexes,
            vertex,
            prevVertex,
            nextVertex
          );
          break;
        case "radial":
          vertex = generateRadialVertexCoordinates(
            vertexes,
            vertex,
            prevVertex,
            nextVertex
          );
          break;
        default:
          throw `Type for group ${groupIndex} seems to be wrong.`;
          break;
      }
      // Set distance, round, and radius values per vertex
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
      vertexes[i].indexWithingGroup = indexWithingGroup;
    }
  }
  path.vertexes = vertexes;
  return path;
};

const remapVertexes = (vertexes: Vertex[]): Vertex[] => {
  /*
   * Add "M" vertex to the array at the start
   * Move first vertex to the end
   * Set index to each vertex
   */

  var newArray = [];
  vertexes[vertexes.length] = vertexes[0];
  vertexes[0] = { ...vertexes[0], type: "M" };
  vertexes = vertexes.map((vertex, index) => ({ ...vertex, index }));
  return vertexes;
};

const setArms = (path: PathData, mode: string): PathData => {
  var { vertexes } = path;
  var { groups, averageLength } = path.parameters;
  var numOfPoints = vertexes.length - 1; // Minus "M" vertex
  var firstArmFactors: number[] = [];
  var secondArmFactors: number[] = [];
  var averageLength: number;
  for (let i = 1; i < vertexes.length; i++) {
    // Adapt arms
    let firstArmAdapt = getAdaptArmsValue(
      groups[vertexes[i - 1].group],
      vertexes[i - 1].indexWithingGroup
    );
    let secondArmAdapt = getAdaptArmsValue(
      groups[vertexes[i].group],
      vertexes[i].indexWithingGroup
    );

    if (mode === "init" && firstArmAdapt && secondArmAdapt) continue;
    else if (mode === "adapt" && !firstArmAdapt && !secondArmAdapt) continue;

    // Prepare vars
    let firstArmLength, secondArmLength;
    // Smart round
    let firstArmSmartRound = getSmartRoundValue(
      groups[vertexes[i - 1].group],
      vertexes[i - 1].indexWithingGroup
    );
    let secondArmSmartRound = getSmartRoundValue(
      groups[vertexes[i].group],
      vertexes[i].indexWithingGroup
    );
    // Length based round
    let firstArmLengthBasedRound = getLengthBasedRoundValue(
      groups[vertexes[i - 1].group],
      vertexes[i - 1].indexWithingGroup
    );
    let secondArmLengthBasedRound = getLengthBasedRoundValue(
      groups[vertexes[i].group],
      vertexes[i].indexWithingGroup
    );

    // Calc individual factor for smart round
    let individualFactor;
    if (firstArmSmartRound || secondArmSmartRound) {
      let distanceRadians = radiansDelta(
        vertexes[i - 1].radians,
        vertexes[i].radians
      );
      individualFactor = (2 * Math.PI) / distanceRadians;
    }

    // First arm
    if (
      (mode === "adapt" && firstArmAdapt) ||
      (mode === "init" && !firstArmAdapt)
    ) {
      // Calc first arm
      log.info(`calc first arm. Mode: ${mode}`);
      let firstArmFactor = firstArmSmartRound ? individualFactor : numOfPoints;
      firstArmLength = (4 / 3) * Math.tan(Math.PI / (2 * firstArmFactor));
      if (mode === "adapt") {
        // Set scale
        let firstArmScaleFactor = firstArmLengthBasedRound
          ? vertexes[i - 1].length
          : averageLength;
        firstArmLength *= firstArmScaleFactor;
      }
      // Round
      firstArmLength *= vertexes[i - 1].round;
      // Set angle
      let firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
      let firstArmAngle = radToAngle(firstArmRadians);
      log.debug("first arm angle", firstArmAngle);
      // Set cos and sin
      let cosx1 = round(Math.cos(firstArmRadians));
      if (mode === "adapt") cosx1 *= -1;
      let siny1 = round(Math.sin(firstArmRadians));
      // Set coordinates
      let x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
      let y1 = siny1 * firstArmLength + vertexes[i - 1].y;
      log.debug(`vertex ${i} first arm x: ${x1} y: ${y1}`);
      // Add to vertex
      vertexes[i] = {
        ...vertexes[i],
        x1,
        y1,
        cosx1,
        siny1
      };
    }

    // Second arm
    if (
      (mode === "adapt" && secondArmAdapt) ||
      (mode === "init" && !secondArmAdapt)
    ) {
      // Calc second arm
      log.info(`calc second arm. Mode: ${mode}`);
      let secondArmFactor = secondArmSmartRound
        ? individualFactor
        : numOfPoints;
      secondArmLength = (4 / 3) * Math.tan(Math.PI / (2 * secondArmFactor));
      if (mode === "adapt") {
        // Set scale
        let secondArmScaleFactor = secondArmLengthBasedRound
          ? vertexes[i].length
          : averageLength;
        secondArmLength *= secondArmScaleFactor;
      }
      // Set round
      secondArmLength *= vertexes[i].round;
      // Set angle
      let secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
      let secondArmAngle = radToAngle(secondArmRadians);
      log.debug("second arm angle", secondArmAngle);
      // Set cos and sin
      let cosx2 = round(Math.cos(secondArmRadians));
      if (mode === "adapt") cosx2 *= -1;
      let siny2 = round(Math.sin(secondArmRadians));
      // Set coordinates
      let x2 = cosx2 * secondArmLength + vertexes[i].x;
      let y2 = siny2 * secondArmLength + vertexes[i].y;
      log.debug(`vertex ${i} second arm x: ${x2} y: ${y2}`);
      // Add to vertex
      vertexes[i] = {
        ...vertexes[i],
        x2,
        y2,
        cosx2,
        siny2
      };
    }
  }
  return path;
};

const getIncircleValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.incircle;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'incircle' parameter in group number ${group.pk}`;
  else return parameter;
};

const scaleToOne = (path: PathData): PathData => {
  const { groups } = path.parameters;
  let needToScale: boolean;
  for (let index = 0; index < groups.length; index++) {
    // Check settings if it needs to scale
    if (groups[index].incircle) {
      if (getType(groups[index].incircle) === "array") {
        // Incircle is an array. Try to scale
        needToScale = true;
        break;
      }
    } else {
      needToScale = true;
      break;
    }
  }

  if (!needToScale)
    // Incircle value is true. Cancel scale and return path as it is.
    return path;

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
  path.vertexes = path.vertexes.map((vertex, index) => {
    let incircleValue = getIncircleValue(
      groups[vertex.group],
      vertex.indexWithingGroup
    );
    if (!incircleValue) {
      vertex.x = vertex.x * factorX - shiftX;
      vertex.y = vertex.y * factorY - shiftY;
    }
    if (vertex.type === "C") {
      let incircleFirstArmValue = getIncircleValue(
        groups[path.vertexes[index - 1].group],
        path.vertexes[index - 1].indexWithingGroup
      );
      if (!incircleFirstArmValue) {
        vertex.x1 = vertex.x1 * factorX - shiftX;
        vertex.y1 = vertex.y1 * factorY - shiftY;
      }
      if (!incircleValue) {
        vertex.x2 = vertex.x2 * factorX - shiftX;
        vertex.y2 = vertex.y2 * factorY - shiftY;
      }
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
  var { vertexes } = path;
  var { groups } = path.parameters;
  path.vertexes = path.vertexes.map((vertex, index) => {
    // Setup distance
    vertex.x *= vertex.distance;
    vertex.y *= vertex.distance;
    if (vertex.type === "C") {
      // Setup distance
      vertex.x1 *= vertexes[index - 1].distance;
      vertex.y1 *= vertexes[index - 1].distance;
      vertex.x2 *= vertex.distance;
      vertex.y2 *= vertex.distance;
    }
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
  var maxLength: number = 0;
  var minLength: number = 0;
  var averageLength: number = 0;
  var maxLengthByGroup: number[] = [];
  var minLengthByGroup: number[] = [];
  var averageLengthByGroup: number[] = [];

  for (let i = 0; i < parameters.numOfGroups; i++) {
    maxLengthByGroup[i] = 0;
    minLengthByGroup[i] = 0;
    averageLengthByGroup[i] = 0;
  }

  path.vertexes = path.vertexes.map(vertex => {
    let x = vertex.x - parameters.centerX;
    let y = vertex.y - parameters.centerY;
    vertex.length = Math.sqrt(x * x + y * y);

    // Average length
    averageLength += vertex.length;
    averageLengthByGroup[vertex.group] += vertex.length;

    // min & max length
    if (vertex.length < minLength || minLength === 0) minLength = vertex.length;
    if (vertex.length > maxLength || maxLength === 0) maxLength = vertex.length;

    if (
      vertex.length > maxLengthByGroup[vertex.group] ||
      maxLengthByGroup[vertex.group] === 0
    )
      maxLengthByGroup[vertex.group] = vertex.length;

    if (
      vertex.length < minLengthByGroup[vertex.group] ||
      minLengthByGroup[vertex.group] === 0
    )
      minLengthByGroup[vertex.group] = vertex.length;

    return vertex;
  });

  for (let i = 0; i < averageLengthByGroup.length; i++)
    averageLengthByGroup[i] =
      averageLengthByGroup[i] / parameters.groups[i].numOfVertexes;

  parameters.averageLength = averageLength / path.vertexes.length;
  parameters.averageLengthByGroup = averageLengthByGroup;
  parameters.minLength = minLength;
  parameters.minLengthByGroup = minLengthByGroup;
  parameters.maxLength = maxLength;
  parameters.maxLengthByGroup = maxLengthByGroup;

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
    if (vertex.type === "C") {
      let prevFactor = vertexes[i - 1].radius
        ? calcFactor(vertexes[i - 1].radius, vertexes[i - 1].length)
        : 1;
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
  log.debug(path);
  return path;
};

const recalcRadians = (path: PathData): PathData => {
  log.info("recalculate radians");
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
        vertex.d = `${vertex.type}\n${vertex.x1} ${vertex.y1},\n${vertex.x2} ${vertex.y2},\n${vertex.x} ${vertex.y}`;
        break;
      default:
        vertex.d = ``;
    }
    return vertex;
  });
  var d = "";
  path.vertexes.forEach((vertex, i) => {
    d += "\n\n" + vertex.d;
  });
  d += "\n\nZ";
  path.d = d;
  return path;
};

/********
 * Root *
 ********/

const pathLayer = (
  parameters: InputParameters = defaultParameters
): PathData => {
  // Setup defaults
  var path: PathData = { parameters };
  path = setDefaults(path);

  // Generate shape
  path = generateFrame(path);
  path = generateVertexes(path);
  path.vertexes = remapVertexes(path.vertexes); // Add M point
  path = setArms(path, "init");

  path = scaleToOne(path);
  path = setCenter(path);
  path = setDistance(path);
  path = setPosition(path);
  path = setScale(path);
  path = calcLength(path);
  path = setLength(path);
  path = calcLength(path);
  path = recalcRadians(path);
  path = setArms(path, "adapt");
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
  groups: [
    {
      type: "linear",
      incircle: false,
      round: 0.5,
      lengthBasedRound: false,
      adaptArms: false,
      distance: 1,
      smartRound: false,
      preserveRadians: false
    }
  ]
};

export default pathLayer;
