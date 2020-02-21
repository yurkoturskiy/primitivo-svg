import { round, radToAngle, angleToRad } from "../misc/index";
import {
  PathData,
  GroupParameters,
  Frame,
  InputParameters,
  FrameVertex,
  FrameParameters
} from "./interfaces";
import parseGroupParameter from "./lib/parseGroupParameter";
import { pipe } from "fp-ts/lib/pipeable";

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

const setFrameParameters = (parameters: InputParameters): FrameParameters => ({
  numOfSegments: parameters.numOfSegments,
  depth: parameters.depth,
  rotate: parameters.rotate,
  group: parameters.groups[0]
});

const setNumOfVertexes = (frame: FrameParameters) => ({
  ...frame,
  numOfVertexes: frame.numOfSegments * Math.pow(2, frame.depth)
});

const vertexesReducer = (frame: Frame) => (
  acc: FrameVertex[],
  vertex: FrameVertex,
  i: number
) => {
  let radians: number;
  radians = frame.group.radians
    ? getRadiansValue(frame.group, i) // curtom radians were provide
    : ((Math.PI * 2) / frame.numOfVertexes) * i;
  // Rotate
  radians = radians + angleToRad(frame.rotate);

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
};

const setVertexes = (frame: Frame) => ({
  ...frame,
  vertexes: Array(frame.numOfVertexes)
    .fill({})
    .reduce(vertexesReducer(frame), [])
});

/**
 * Generate frame which is the base for a path and
 * serve as the base for a 0-group vertexes.
 */
export default (path: PathData): PathData => ({
  ...path,
  frame: pipe(
    setFrameParameters(path.parameters),
    setNumOfVertexes,
    setVertexes
  )
});
