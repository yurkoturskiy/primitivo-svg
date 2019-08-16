import * as log from "loglevel";
// Layers
import generateShapes from "../pathLayer/index";
// Interfaces
import {
  AnimateParameters,
  KeyPathParameters,
  GroupParameters,
  AnimateValue,
  Output,
  CalcInterpolationInput,
  CalcInterpolationOutput
} from "./interfaces";
import { Parameters as PathParameters } from "../pathLayer/interfaces";
// misc functions
import solveCubicEquation from "./solveCubicEquation";

const getType = (item: any): string => {
  if (Array.isArray(item)) return "array";
  if (typeof item === "object") return "object";
  if (typeof item === "number") return "number";
};

const getValueFromRange = (
  values: number[],
  numOfKeyPaths: number,
  index: number
) => {
  let min: number = Math.min(...values);
  let max: number = Math.max(...values);
  return ((max - min) / numOfKeyPaths) * index + min;
};

export default function animateValue(
  parameters: AnimateParameters = defaults.parameters,
  keyPathsParameters: KeyPathParameters = defaults.keyPathsParameters
): Output {
  /*
   * Generate paths and return string for values option of animate tag.
   * Example:
   *   <animate values={values} ... />
   *
   * Figure out first how pathLayer works.
   */

  const generateDValues = () => {
    const { numOfKeyPaths, loop } = parameters;
    let inputKeyPathsParameters: any = keyPathsParameters; // Maybe need to refactor
    let paths = [];
    let dValues: string[] | string = [];
    for (let i = 0; i < numOfKeyPaths; i++) {
      var pathParameters: any = {};
      for (let key in inputKeyPathsParameters) {
        // Set parameters for 'i' key path
        if (key === "groups") {
          if (getType(inputKeyPathsParameters[key][0] === "object"))
            // One setup for all key paths groups
            pathParameters[key] = inputKeyPathsParameters[key];
          else pathParameters[key] = inputKeyPathsParameters[key];
          console.log("group param", pathParameters[key]);
        } else if (typeof inputKeyPathsParameters[key] !== "object") {
          // if one value for all paths
          pathParameters[key] = inputKeyPathsParameters[key];
        } else {
          if (inputKeyPathsParameters[key].length === numOfKeyPaths)
            // if individual values for each path
            pathParameters[key] = inputKeyPathsParameters[key][i];
          else if (inputKeyPathsParameters[key].length === 2)
            // calculate value from [min number, max number] range
            pathParameters[key] = getValueFromRange(
              inputKeyPathsParameters[key],
              numOfKeyPaths,
              i
            );
          else throw `Wrong '${key}' parameter array at ${i} key path`;
        }
      }
      let path = generateShapes(pathParameters);
      paths[i] = path;
      dValues[i] = path.d;
      if (loop && i !== numOfKeyPaths - 1)
        dValues[(numOfKeyPaths - 1) * 2 - i] = path.d;
    }
    dValues = dValues.join(";");
    return dValues;
  };

  const pointToNumber = (point: string): number[] => {
    console.log("point to number", point);
    let p: string[] | number[] = point.split(",");
    p = [Number(p[0]), Number(p[1])];
    log.debug("converted point to number", p);
    return p;
  };

  const pointToString = (point: number[]): string => point.join(",");

  function calcTime(
    p1y: number,
    p2y: number,
    p3y: number,
    p4y: number,
    py: number
  ): number {
    var a = p4y - 3 * p3y + 3 * p2y - p1y;
    console.log("a", a);
    var b = 3 * (p3y - 2 * p2y + p1y);
    console.log("b", b);
    var c = 3 * (p2y - p1y);
    console.log("c", c);
    var d = p1y - py;
    console.log("d", d);
    let ts = solveCubicEquation(a, b, c, d);
    for (let t of ts) {
      if (t > 0 && t < 1) return t;
    }
    return ts[1];
  }

  function calcPx(
    p1x: number,
    p2x: number,
    p3x: number,
    p4x: number,
    t: number
  ): number {
    var p =
      p1x * Math.pow(1 - t, 3) +
      3 * p2x * t * Math.pow(1 - t, 2) +
      3 * p3x * Math.pow(t, 2) * (1 - t) +
      p4x * Math.pow(t, 3);
    return p;
  }

  const setSpacing = () => {
    const { keyTimes, keySplines, progression } = parameters;

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
      console.log("p", i);
      if (splines[i] == null) {
        console.log(splines[i]);
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
      let factor = [1 / bzs[i + 1][0], 1 / bzs[i + 1][1]];
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
    console.log("splines", splines);
    return { keySplines: splines.join("; "), keyTimes: keyTimes.join("; ") };
  };

  var output: Output = {};
  if ((parameters.keySplines, parameters.keyTimes, parameters.progression))
    output = setSpacing();
  output.dValues = generateDValues();
  return output;
}

const defaults = {
  parameters: {
    loop: true,
    numOfKeyPaths: 3
  },
  keyPathsParameters: {
    numOfSegments: 3,
    depth: 0,
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    centerX: 100,
    centerY: 100,
    rotate: 0,
    numOfGroups: 2,
    incircle: true,
    groups: [
      [
        {
          type: "radial",
          distance: 1,
          round: 1
        },
        {
          type: "radial",
          distance: 1,
          round: 1
        }
      ],
      [
        {
          type: "radial",
          distance: 1,
          round: 0.4
        },
        {
          type: "linear",
          distance: 0.6,
          round: 3
        }
      ],
      [
        {
          type: "radial",
          distance: 1,
          round: 0.1
        },
        {
          type: "linear",
          distance: 1,
          round: 3
        }
      ]
    ]
  }
};
