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
import setPosition from "./lib/setPosition";
import setScale from "./lib/setScale";
import calcLength from "./lib/calcLength";
import setLength from "./lib/setLength";
import recalcRadians from "./lib/recalcRadians";

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
