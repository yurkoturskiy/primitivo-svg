import { Spacing } from "../../interfaces";
import pointToString from "./pointToString";
var log = require("loglevel").getLogger("spacing-log");

const transform = (
  spacing: Spacing,
  spline: number[],
  index: number,
  splines: number[][]
) => {
  const { progression } = spacing.parameters;
  const { bzs, keyTimesList } = spacing;
};

const transformSplines = (spacing: Spacing): Spacing => {
  let splines: any = spacing.keySplinesList.concat();
  const { progression } = spacing.parameters;
  const { bzs, keyTimesList } = spacing;
  for (let i = 0; i < progression.length - 1; i++) {
    splines[i] = [splines[i][0] - bzs[i][0], splines[i][1] - bzs[i][1]];
    splines[i + 1] = [
      splines[i + 1][0] - bzs[i][0],
      splines[i + 1][1] - bzs[i][1],
    ];
    let factor = [
      1 / (bzs[i + 1][0] - bzs[i][0]),
      1 / (bzs[i + 1][1] - bzs[i][1]),
    ];
    log.debug("factor", factor);
    splines[i] = [splines[i][0] * factor[0], splines[i][1] * factor[1]];
    splines[i + 1] = [
      splines[i + 1][0] * factor[0],
      splines[i + 1][1] * factor[1],
    ];
    splines[i] = pointToString(splines[i]);
    splines[i + 1] = pointToString(splines[i + 1]);
    splines[i] = [splines[i], splines[i + 1]];
    splines.splice(i + 1, 1);
  }
  log.debug("splines", splines);
  return {
    ...spacing,
    // keySplines: spacing.keySplinesList.reduce(transform, spacing).join("; "),
    keySplines: splines.join("; "),
    keyTimes: keyTimesList.join("; "),
  };
};

export default transformSplines;
