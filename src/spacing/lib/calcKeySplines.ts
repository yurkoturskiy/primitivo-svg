import pointToNumber from "./pointToNumber";
import calcTime from "./calcTime";
import calcPx from "./calcPx";
import { Spacing, Parameters } from "../interfaces";
import { update } from "ramda";
import { pipe } from "fp-ts/lib/pipeable";

var log = require("loglevel").getLogger("spacing-log");

const parseSplines = (splines: string[]): number[][] | null[] =>
  splines.reduce((acc, spline) => {
    return [...acc, spline == null ? spline : pointToNumber(spline)];
  }, []);

const initBzs = (amount: number): number[][] =>
  pipe(update(0, [0, 0], Array(amount)), update(-1, [1, 1]));

const calcKeySplines = (parameters: Parameters): Spacing => {
  var { keyTimes, keySplines, progression } = parameters;
  let splines = parseSplines(keySplines as string[]);
  log.debug("converted splines", splines);
  var bzs: number[][] = initBzs(keyTimes.length);
  let t: number;
  var p, p1, p2, p3, p4, p5, p6, p7, p8, p9: number[];
  p = []; // proto bz
  p4 = [1, 1];
  var p3Index: number;
  // Calc keySplines
  for (let i = 1; i < splines.length; i += 2) {
    log.debug("p", i);
    if (splines[i] == null) {
      log.debug(splines[i]);
      if (!p3Index || i > p3Index) {
        for (let end = i; i < splines.length; end++) {
          // Find next key spline
          if (splines[end] != null) {
            p3Index = end;
            break;
          }
        }
      }

      // Calc points of a spline
      let p1 = bzs[(i + (i % 2)) / 2 - 1];
      let p2 = splines[i - 1];
      let p3 = splines[p3Index];
      p[1] = progression[(i + (i % 2)) / 2];
      t = calcTime(p1[1], p2[1], p3[1], p4[1], p[1]);
      p[0] = calcPx(p1[0], p2[0], p3[0], p4[0], t);
      p5 = [(1 - t) * p1[0] + t * p2[0], (1 - t) * p1[1] + t * p2[1]];
      p6 = [(1 - t) * p2[0] + t * p3[0], (1 - t) * p2[1] + t * p3[1]];
      p7 = [(1 - t) * p3[0] + t * p4[0], (1 - t) * p3[1] + t * p4[1]];
      p8 = [(1 - t) * p5[0] + t * p6[0], (1 - t) * p5[1] + t * p6[1]];
      p9 = [(1 - t) * p6[0] + t * p7[0], (1 - t) * p6[1] + t * p7[1]];

      splines[i - 1] = p5.concat();
      splines[i] = p8.concat();
      splines[i + 1] = p9.concat();
      splines[p3Index] = p7.concat();
      bzs[(i + (i % 2)) / 2] = p.concat();
      keyTimes[(i + (i % 2)) / 2] = p[0];
    }
  }
  log.debug("key times", keyTimes);
  log.debug("bzs", bzs);
  log.debug("splines before transformation", splines.concat());
  return { parameters, keySplinesList: splines, keyTimesList: keyTimes, bzs };
};

export default calcKeySplines;
