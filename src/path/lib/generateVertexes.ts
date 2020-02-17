import { GroupParameters, PathData, Vertex } from "../interfaces";
import parseGroupParameterReducer from "./parseGroupParameterReducer";
import parseGroupParameter from "./parseGroupParameter";
import { radToAngle, radiansDelta, round } from "../../misc";

// Logging
var log = require("loglevel").getLogger("path-log");

const getRoundValue = (
  group: GroupParameters,
  vertexIndex: number
): number[] => {
  /* Get round value for a vertex from given group parameters */
  let value: any = group.round;
  value = parseGroupParameterReducer("round", value, vertexIndex);
  if (typeof value !== "object" || value.length !== 2)
    throw `Wrong 'round' value in group number ${group.pk}. Round: ${value}`;
  else return value;
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

const getTypeValue = (group: GroupParameters, vertexIndex: number): string => {
  let parameter: any = group.type;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "string")
    throw `Wrong 'type' parameter in group number ${group.pk}`;
  else return parameter;
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

export default generateVertexes;
