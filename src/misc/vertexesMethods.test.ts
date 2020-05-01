import {
  setEach,
  randomRangePerEach,
  oneToAll,
  randomRangeForAll,
} from "./vertexesMethods";

test("Set values per each vertex", () => {
  const inputParams = [0, 1, 0.5, 4];
  const getPointsParameters: Function = setEach(...inputParams);
  const allVertexesParams: number[] = getPointsParameters(4);
  expect(allVertexesParams).toEqual([0, 1, 0.5, 4]);
});

test("Set one value to all vertexes", () => {
  const numOfVertexes = 4;
  const getPointsParameters = oneToAll(1);
  const allVertexesParams = getPointsParameters(numOfVertexes);
  // Check number of vertexes in array
  expect(allVertexesParams).toHaveLength(numOfVertexes);
  expect(allVertexesParams).toEqual([1, 1, 1, 1]);
});

test("Set random range per each vertex", () => {
  const floorValue = 0;
  const ceilingValue = 1;
  const numOfVertexes = 6;
  const getPointsParameters = randomRangePerEach(floorValue, ceilingValue);
  const allVertexesParams: number[] = getPointsParameters(numOfVertexes);
  // Check number of vertexes in array
  expect(allVertexesParams).toHaveLength(numOfVertexes);
  for (const vertexParam of allVertexesParams) {
    // Check each value in the array if it not out of range
    expect(vertexParam).toBeWithinRange(floorValue, ceilingValue);
  }
});

test("Set random range to all vertexes", () => {
  const floorValue = 0;
  const ceilingValue = 0.6;
  const numOfVertexes = 4;
  const getPointsParameters = randomRangeForAll(floorValue, ceilingValue);
  const allVertexesParams: number[] = getPointsParameters(numOfVertexes);
  // Check number of vertexes in array
  expect(allVertexesParams).toHaveLength(numOfVertexes);
  for (const vertexParam of allVertexesParams) {
    expect(vertexParam).toBeWithinRange(floorValue, ceilingValue);
  }
});

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return pass
      ? {
          message: () =>
            `expected ${received} not to be within range ${floor} - ${ceiling}`,
          pass: true,
        }
      : {
          message: () =>
            `expected ${received} to be within range ${floor} - ${ceiling}`,
          pass: false,
        };
  },
});
