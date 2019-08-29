///////////////////
// TS Interfaces //
///////////////////

export interface PathData {
  // Output object
  frame?: Frame;
  parameters: PathParameters;
  vertexes?: Vertex[];
  keyframes?: Keyframe[];
  d?: string;
}

export interface InputParameters {
  // Input object
  numOfSegments: number;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  rotate: number;
  numOfGroups: number;
  incircle: boolean;
  groups: GroupParameters[];
}

export interface PathParameters extends InputParameters {
  averageLength?: number;
  maxLength?: number;
  minLength?: number;
  averageLengthByGroup?: number[];
  maxLengthByGroup?: number[];
  minLengthByGroup?: number[];
}

export interface GroupParameters {
  // Part of Parameters
  pk?: number; // number of group
  type: string | string[]; // linear | radial | combined(not implemented)
  distance: number | number[] | number[][]; // for all | random range | per vertex
  round: number | number[] | number[][]; // for all | random range | per vertex
  smartRound?: boolean | boolean[]; // Able to create perfect circle from a polygon with custom radians
  lengthBasedRound?: boolean | boolean[]; // The longer distance from center the bigger round factor is
  adaptArms?: boolean | boolean[]; // Keep arms always perpendicular to center
  radius?: number | number[] | number[][]; // for all | random range | per vertex
  radians?: number[]; // Custom radians for each point of a group
  // preserveRadians?: boolean; // Keep the angle on transformation (not implemented)
  numOfVertexes?: number;
}

export interface Vertex {
  type?: string;
  group?: number;
  round?: number;
  distance?: number;
  radius?: number;
  radians?: number;
  angle?: number;
  x?: number;
  y?: number;
  cosx?: number;
  siny?: number;
  x1?: number;
  y1?: number;
  cosx1?: number;
  siny1?: number;
  x2?: number;
  y2?: number;
  cosx2?: number;
  siny2?: number;
  length?: number;
  d?: string;
}

export interface FrameVertex {
  cosx: number;
  siny: number;
  x: number;
  y: number;
  radians: number;
  angle: number;
}

export interface Frame {
  vertexes: FrameVertex[];
  numOfVertexes: number;
}

export interface Keyframe {
  vertexes: Vertex[];
  keyTime: number;
  keySpline?: number;
  d: string;
}
