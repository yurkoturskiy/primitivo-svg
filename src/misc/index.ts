export const round = (number: number): number => Math.round(number * 1e6) / 1e6;

export const radToAngle = (rad: number): number => (rad * 180) / Math.PI;

export const angleToRad = (angle: number): number => (angle * Math.PI) / 180;

export const randomFromRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export const radiansDelta = (a: number, b: number): number => {
  let delta = Math.abs(a - b);
  if (delta > Math.PI) delta = 2 * Math.PI - delta;
  return delta;
};

export const getType = (item: any): string => {
  if (Array.isArray(item)) return "array";
  if (typeof item === "object") return "object";
  if (typeof item === "number") return "number";
};
