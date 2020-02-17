import { round, radToAngle, radiansDelta, getType } from "../misc/index";

// Interfaces
import {
  Vertex,
  PathData,
  InputParameters,
  GroupParameters
} from "./interfaces";
import { pipe } from "ramda";

import defaultParameters from "./lib/defaultParameters";
import initState from "./lib/initState";
import parseGroupParameter from "./lib/parseGroupParameter";
import setFrame from "./lib/setFrame";
import generateVertexes from "./lib/generateVertexes";

// Logging
var log = require("loglevel").getLogger("path-log");

/***********
 * Methods *
 ***********/

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

const remapVertexes = (path: PathData): PathData => {
  /*
   * Add "M" vertex to the array at the start
   * Move first vertex to the end
   * Set index to each vertex
   */
  const { vertexes } = path;

  vertexes[vertexes.length] = vertexes[0];
  vertexes[0] = { ...vertexes[0], type: "M" };
  const newVertexes = vertexes.map((vertex, index) => ({ ...vertex, index }));
  return { ...path, vertexes: newVertexes };
};

const setArms = (mode: string, path: PathData): PathData => {
  var { vertexes } = path;
  var { groups, averageLength } = path.parameters;
  var numOfPoints = vertexes.length - 1; // Minus "M" vertex
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
      firstArmLength *= vertexes[i - 1].round[1];
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
      secondArmLength *= vertexes[i].round[0];
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
  const factorX = 1 - parameters.centerX / (parameters.width / 2);
  const factorY = 1 - parameters.centerY / (parameters.height / 2);
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
  var maxLengthByGroup: number[] = Array(parameters.numOfGroups).fill(0);
  var minLengthByGroup: number[] = Array(parameters.numOfGroups).fill(0);
  var averageLengthByGroup: number[] = Array(parameters.numOfGroups).fill(0);

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

  averageLengthByGroup = averageLengthByGroup.map(
    (len, i) => len / parameters.groups[i].numOfVertexes
  );

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
  let path = initState(parameters);
  // Generate shape
  path = setFrame(path);
  path = generateVertexes(path);
  path = remapVertexes(path); // Add M point
  path = setArms("init", path);

  path = scaleToOne(path);
  path = setCenter(path);
  path = setDistance(path);
  path = setPosition(path);
  path = setScale(path);
  path = calcLength(path);
  path = setLength(path);
  path = calcLength(path);
  path = recalcRadians(path);
  path = setArms("adapt", path);
  path = shift(path);
  path = generateD(path);
  return path;
};

export default pathLayer;
