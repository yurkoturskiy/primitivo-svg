// One round value for both arms
export const oneToBoth = (value: number): [number, number] => [value, value];

// Round per arm
export const perArm = (first: number, second: number): [number, number] => [
  first,
  second,
];
