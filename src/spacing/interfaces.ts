export interface Parameters {
  progression?: number[];
  keyTimes?: number[];
  keySplines?: string | string[];
}

export interface Spacing {
  parameters: Parameters;
  keyTimes?: string;
  keyTimesList: number[];
  keySplines?: string;
  keySplinesList: number[][];
  bzs: number[][];
}
