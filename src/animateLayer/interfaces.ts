export interface AnimateParameters {
  numOfKeyPaths: number;
  progression?: number[];
  keyTimes?: number[];
  keySplines?: string[];
  loop: boolean;
}

export interface KeyPathParameters {
  // Input object
  numOfSegments: number | number[];
  depth: number | number[];
  x: number | number[];
  y: number | number[];
  width: number | number[];
  height: number | number[];
  centerX: number | number[];
  centerY: number | number[];
  rotate: number | number[];
  numOfGroups: number | number[];
  incircle: boolean | boolean[];
  groups: GroupParameters[] | GroupParameters[][];
}

export interface GroupParameters {
  // Part of Parameters
  pk?: number; // number of group
  type?: string; // linear | radial | combined(not implemented)
  distance?: number | number[] | number[][]; // for all | random range | per vertex
  round?: number | number[] | number[][]; // for all | random range | per vertex
  smartRound?: boolean; // Round polygons with custom radians to circle
  radius?: number | number[] | number[][]; // for all | random range | per vertex
  radians?: number[]; // Custom radians for each point of a group
  preserveRadians?: boolean; // Keep the angle on transformation (not implemented)
  numOfVertexes?: number;
}

export interface AnimateValue {
  value: string;
  keyTimes: string;
  keySplines: string;
}

export interface Output {
  dValues?: string;
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
