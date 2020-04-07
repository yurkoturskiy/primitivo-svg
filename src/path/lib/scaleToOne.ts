import { PathData, GroupParameters } from "../interfaces";
import parseGroupParameter from "./parseGroupParameter";
import { getType } from "../../misc";

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

  const { maxX, minX, maxY, minY } = path.vertexes.reduce(
    (acc, vertex) => ({
      maxX: vertex.x > acc.maxX ? vertex.x : acc.maxX,
      minX: vertex.x < acc.minX ? vertex.x : acc.minX,
      maxY: vertex.y > acc.maxY ? vertex.y : acc.minY,
      minY: vertex.y < acc.minY ? vertex.y : acc.minY,
    }),
    { maxX: 0, minX: 0, maxY: 0, minY: 0 }
  );
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

export default scaleToOne;
