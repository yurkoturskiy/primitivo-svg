export const setEach = <T>(...parameters: T[]) => (
  numOfVertexes: number
): T[] => [...parameters];

// Fill all with one value
export const oneToAll = (value: number | number[]) => (numOfVertexes: number) =>
  Array(numOfVertexes).fill(value);

