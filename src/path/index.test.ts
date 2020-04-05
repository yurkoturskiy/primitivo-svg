import pathLayer from "./index";

test("path layer test", () => {
  const path = pathLayer({
    numOfSegments: 3,
    depth: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    centerX: 30,
    centerY: 30,
    rotate: 0,
    numOfGroups: 1,
    groups: [
      {
        type: "radial",
        incircle: true,
        distance: 0.7,
        round: 1,
      },
    ],
  });

  const d =
    "M 78.99999999999999 43.99999999999999 C 78.99999999999999 70.94301256218253, 49.83332245416413 87.78238128109126, 26.5 74.310875 C 3.1666775458358707 60.83936871890874, 3.1666775458358707 27.160631281091263, 26.5 13.689124999999997 C 49.83332245416413 0.21761871890873508, 78.99999999999999 17.056987437817465, 78.99999999999999 43.99999999999999 Z";

  expect(path.d).toEqual(d);
});
