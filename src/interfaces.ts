///////////////////
// TS Interfaces //
///////////////////

export interface PathData {
  // Output object
  frame?: Frame;
  parameters: Parameters;
  vertexes?: Vertex[];
  keyframes?: Keyframe[];
  svgPathData?: string;
}

export interface Parameters {
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

export interface GroupParameters {
  // Part of Parameters
  round: number | number[];
  roundPerVertex?: number[] | number[][];
  distance: number | number[];
  distancePerVertex?: number[] | number[][];
  radius?: number | number[];
  radiusPerVertex?: number[] | number[][];
  animate?: AnimateParameters;
  numOfVertexes?: number;
}

export interface Vertex {
  type?: string;
  group?: number;
  round?: number;
  distance?: number;
  radius?: number;
  radians?: number;
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

export interface AnimateParameters {
  type: string;
  distance: number[];
  round: number[];
  duration: number[];
}

export interface Keyframe {
  vertexes: Vertex[];
  keyTime: number;
  keySpline?: number;
  d: string;
}
