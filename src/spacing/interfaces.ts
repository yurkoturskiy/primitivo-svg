export interface Parameters {
  progression?: number[];
  keyTimes?: number[];
  keySplines?: string | string[];
}

export interface Output {
  keyTimes: string;
  keySplines: string;
}
