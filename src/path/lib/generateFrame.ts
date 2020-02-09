import { round, radToAngle, angleToRad } from "../../misc/index";
import { PathData, GroupParameters } from "../interfaces";
import parseGroupParameter from "./parseGroupParameter";

const calcNumOfVertexes = (numOfSegments: number, depth: number): number =>
  numOfSegments * Math.pow(2, depth);

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

const generateFrame = (path: PathData): PathData => {
  /*
   * Generate frame which is the base for a path and
   * serve as the base for a 0-group vertexes.
   */

  const { depth, rotate, numOfSegments, groups } = path.parameters;
  const numOfVertexes: number = calcNumOfVertexes(numOfSegments, depth);
  // var vertexes = [];
  const vertexes = Array(numOfVertexes)
    .fill({})
    .reduce((acc, vertex, i) => {
      let radians: number;
      radians = groups[0].radians
        ? getRadiansValue(groups[0], i) // curtom radians were provide
        : ((Math.PI * 2) / numOfVertexes) * i;
      // Rotate
      radians = radians + angleToRad(rotate);

      const angle = radToAngle(radians);
      const cosx = round(Math.cos(radians));
      const siny = round(Math.sin(radians));
      const x = cosx;
      const y = siny;
      return [
        ...acc,
        {
          cosx,
          siny,
          x,
          y,
          radians,
          angle
        }
      ];
    }, []);

  return {
    ...path,
    frame: {
      vertexes,
      numOfVertexes: vertexes.length
    }
  };
};

export default generateFrame;
