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
    return p;
  };

  const pointToString = (point: number[]): string => point.join(",");

  const calcInterpolation = (
    parameters: CalcInterpolationInput
  ): CalcInterpolationOutput => {
    var { t, p1, p2, p3, p4 } = parameters;
    log.debug("interpolation input parameters", parameters);
    let p5: number[] = [
      (1 - t) * p1[0] + t * p2[0],
      (1 - t) * p1[1] + t * p2[1]
    ];
    let p6: number[] = [
      (1 - t) * p2[0] + t * p3[0],
      (1 - t) * p2[1] + t * p3[1]
    ];
    let p7: number[] = [
      (1 - t) * p3[0] + t * p4[0],
      (1 - t) * p3[1] + t * p4[1]
    ];
    let p8: number[] = [
      (1 - t) * p5[0] + t * p6[0],
      (1 - t) * p5[1] + t * p6[1]
    ];
    let p9: number[] = [
      (1 - t) * p6[0] + t * p7[0],
      (1 - t) * p6[1] + t * p7[1]
    ];
    let bz: number[] = [
      (1 - t) * p8[0] + t * p9[0],
      (1 - t) * p8[1] + t * p9[1]
    ];
    return { p5, p6, p7, p8, p9, bz };
  };

  const setSpacing = () => {
    const { keyTimes, keySplines } = parameters;

    let splines: any = keySplines.concat();
    for (let i = 0; i < splines.length; i++) {
      if (splines[i] !== "pass") splines[i] = pointToNumber(splines[i]);
    }
    var bzs: number[][] = [];
    bzs[0] = [0, 0];
    bzs[keyTimes.length - 1] = [1, 1];
    var p4: number[] = [1, 1];
    var p3Index: number;
    let t: number;

    for (let i = 1; i < splines.length; i += 2) {
      console.log("p", i);
      if (splines[i] === "pass") {
        console.log(splines[i]);
        if (!p3Index || i > p3Index) {
          for (let end = i; i < splines.length; end++) {
            // Find next key spline
            if (splines[end] !== "pass") {
              p3Index = end;
              break;
            }
          }
        }
        t = keyTimes[(i + (i % 2)) / 2];
        const interpolation = calcInterpolation({
          t,
          p1: bzs[(i + (i % 2)) / 2 - 1],
          p2: splines[i - 1],
          p3: splines[p3Index],
          p4
        });
        console.log("interpolation", interpolation);
        const { p5, p6, p7, p8, p9, bz } = interpolation;
        splines[i - 1] = p5;
        splines[i] = p8;
        splines[i + 1] = p9;
        splines[p3Index] = p7;
        bzs[(i + (i % 2)) / 2] = bz;
      }
    }
    log.debug("bzs", bzs);
    for (let i = 0; i < bzs.length - 1; i++) {}
    for (let i = 0; i < keyTimes.length - 1; i++) {
      let factor = [
        (1 + bzs[i][0]) / bzs[i + 1][0],
        (1 + bzs[i][1]) / bzs[i + 1][1]
      ];
      log.debug("factor", factor);
      splines[i] = [
        splines[i][0] * factor[0] - bzs[i][0],
        splines[i][1] * factor[1] - bzs[i][1]
      ];
      splines[i + 1] = [
        splines[i + 1][0] * factor[0] - bzs[i][0],
        splines[i + 1][1] * factor[1] - bzs[i][1]
      ];
      splines[i] = pointToString(splines[i]);
      splines[i + 1] = pointToString(splines[i + 1]);
      splines[i] = [splines[i], splines[i + 1]];
      splines.splice(i + 1, 1);
    }
    console.log("splines", splines);
    return splines.join(";");
  };

  var output: Output = {};
  output.dValues = generateDValues();
  output.keySplines = setSpacing();
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
