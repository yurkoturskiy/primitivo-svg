export const setEach = <T>(...parameters: T[]) => (
  numOfVertexes: number
): T[] => [...parameters];

// Fill all with one value
export const oneToAll = (value: number | [number, number]) => (
  numOfVertexes: number
) => Array(numOfVertexes).fill(value);

// Create unique random values for each vertex
export const randomRangePerEach = (min: number, max: number) => (
  numOfVertexes: number
): number[] =>
  Array(numOfVertexes)
    .fill(0)
    .map(() => Math.random() * (max - min) + min);

