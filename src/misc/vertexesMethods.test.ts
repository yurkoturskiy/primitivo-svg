const allPoints = <T>(...parameters: T[]) => (numOfVertexes: number): T[] => [
  ...parameters,
];

test("set all points at groups parameters", () => {
  const inputParams = [0, 1, 0.5, 4];
  const getPointsParameters: Function = allPoints(...inputParams);
  const allVertexesParams: number[] = getPointsParameters(4);
  expect(allVertexesParams).toEqual([0, 1, 0.5, 4]);
});

