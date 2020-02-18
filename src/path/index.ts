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
import remapVertexes from "./lib/remapVertexes";
import setArms from "./lib/setArms";
import scaleToOne from "./lib/scaleToOne";
import setCenter from "./lib/setCenter";
import setDistance from "./lib/setDistance";

// logging
var log = require("loglevel").getLogger("path-log");

/***********
 * Methods *
 ***********/

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
