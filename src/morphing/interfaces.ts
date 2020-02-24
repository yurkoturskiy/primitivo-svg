import { GroupParameters } from "../path/interfaces";

export interface AnimateParameters {
  numOfKeyPaths: number;
  loop: string;
}

export interface KeyPathParameters {
  // Input object
  numOfSegments?: number | number[];
  depth?: number | number[];
  x?: number | number[];
  y?: number | number[];
  width?: number | number[];
  height?: number | number[];
  centerX?: number | number[];
  centerY?: number | number[];
  rotate?: number | number[];
  numOfGroups?: number | number[];
  groups?: GroupParameters[] | GroupParameters[][];
}

export interface AnimateValue {
  value: string;
  keyTimes: string;
  keySplines: string;
}

export interface Data {
  parameters?: AnimateParameters;
  keyPathsParameters?: KeyPathParameters;
  dValues?: string;
  numOfKeyPaths?: number;
  keyTimes?: string;
  keySplines?: string;
}

export interface CalcInterpolationInput {
  t: number;
  p1: number[];
  p2: number[];
  p3: number[];
  p4: number[];
}

export interface CalcInterpolationOutput {
  p5: number[];
  p6: number[];
  p7: number[];
  p8: number[];
  p9: number[];
  bz: number[];
}
