// Interfaces
import { Parameters, Output } from "./interfaces";
// misc functions
import calcTime from "./lib/calcTime";
import calcPx from "./lib/calcPx";
import prepareParameters from "./lib/prepareParameters";
import pointToNumber from "./lib/pointToNumber";

var log = require("loglevel").getLogger("spacing-log");

const pointToString = (point: number[]): string => point.join(",");

const spacingLayer = (parameters: Parameters): Output => {
  parameters = prepareParameters(parameters);
  var { keyTimes, keySplines, progression } = parameters;

  let splines: any = keySplines.concat();
  for (let i = 0; i < splines.length; i++) {
    if (splines[i] != null) splines[i] = pointToNumber(splines[i]);
  }
  log.debug("converted splines", splines);
  var bzs: number[][] = [];
  bzs[0] = [0, 0];
  bzs[keyTimes.length - 1] = [1, 1];
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

      let p1 = bzs[(i + (i % 2)) / 2 - 1];
      log.debug("p1", p1);
      let p2 = splines[i - 1];
      log.debug("p2", p2);
      let p3 = splines[p3Index];
      log.debug("p3", p3);
      log.debug("p4", p4);
      p[1] = progression[(i + (i % 2)) / 2];
      t = calcTime(p1[1], p2[1], p3[1], p4[1], p[1]);
      log.debug("t", t);
      p[0] = calcPx(p1[0], p2[0], p3[0], p4[0], t);
      log.debug("p", p);
      p5 = [(1 - t) * p1[0] + t * p2[0], (1 - t) * p1[1] + t * p2[1]];
      log.debug("p5", p5);
      p6 = [(1 - t) * p2[0] + t * p3[0], (1 - t) * p2[1] + t * p3[1]];
      log.debug("p6", p6);
      p7 = [(1 - t) * p3[0] + t * p4[0], (1 - t) * p3[1] + t * p4[1]];
      log.debug("p7", p7);
      p8 = [(1 - t) * p5[0] + t * p6[0], (1 - t) * p5[1] + t * p6[1]];
      log.debug("p8", p8);
      p9 = [(1 - t) * p6[0] + t * p7[0], (1 - t) * p6[1] + t * p7[1]];
      log.debug("p9", p9);

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
  for (let i = 0; i < progression.length - 1; i++) {
    splines[i] = [splines[i][0] - bzs[i][0], splines[i][1] - bzs[i][1]];
    splines[i + 1] = [
      splines[i + 1][0] - bzs[i][0],
      splines[i + 1][1] - bzs[i][1]
    ];
    let factor = [
      1 / (bzs[i + 1][0] - bzs[i][0]),
      1 / (bzs[i + 1][1] - bzs[i][1])
    ];
    log.debug("factor", factor);
    splines[i] = [splines[i][0] * factor[0], splines[i][1] * factor[1]];
    splines[i + 1] = [
      splines[i + 1][0] * factor[0],
      splines[i + 1][1] * factor[1]
    ];
    splines[i] = pointToString(splines[i]);
    splines[i + 1] = pointToString(splines[i + 1]);
    splines[i] = [splines[i], splines[i + 1]];
    splines.splice(i + 1, 1);
  }
  log.debug("splines", splines);
  return { keySplines: splines.join("; "), keyTimes: keyTimes.join("; ") };
};

export default spacingLayer;
