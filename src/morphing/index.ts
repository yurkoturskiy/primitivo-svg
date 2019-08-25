import * as log from "loglevel";
// Layers
import generateShapes from "../path/index";
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
import { Parameters as PathParameters } from "../path/interfaces";

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

function morphingLayer(
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

  const setDefaults = () => {
    parameters = { ...defaults.parameters, ...parameters };
    keyPathsParameters = {
      ...defaults.keyPathsParameters,
      ...keyPathsParameters
    };
  };

  const generateDValues = () => {
    log.info("start generate d values");
    log.debug("parameters", parameters);
    log.debug("key path parameters", keyPathsParameters);
    const { numOfKeyPaths, loop } = parameters;
    let inputKeyPathsParameters: any = keyPathsParameters; // Maybe need to refactor
    let paths = [];
    let dValues: string[] | string = [];
    for (let i = 0; i < numOfKeyPaths; i++) {
      log.info(`generate key path number ${i}`);
      var pathParameters: any = {};
      for (let key in inputKeyPathsParameters) {
        // Set parameters for 'i' key path
        if (key === "groups") {
          if (getType(inputKeyPathsParameters[key][0] === "object"))
            // One setup for all key paths groups
            pathParameters[key] = inputKeyPathsParameters[key];
          else pathParameters[key] = inputKeyPathsParameters[key];
          log.debug("group param", pathParameters[key]);
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

  setDefaults();
  var output: Output = {};
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
      {
        type: "radial",
        distance: [0.95, 1],
        round: 1
      },
      {
        type: "radial",
        distance: [1.3, 1.4],
        round: [0, 0.3]
      }
    ]
  }
};

export default morphingLayer;
