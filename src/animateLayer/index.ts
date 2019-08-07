import * as log from "loglevel";
// Layers
import generateShapes from "../pathLayer/index";
// Interfaces
import { KeyPathParameters, GroupParameters, AnimateValue } from "./interfaces";
import { Parameters as PathParameters } from "../pathLayer/interfaces";

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
  numOfKeyPaths: number,
  keyPathsParameters: KeyPathParameters
) {
  let inputKeyPathsParameters: any = keyPathsParameters; // Maybe need to refactor
  let paths = [];
  for (let i = 0; i < numOfKeyPaths; i++) {
    var pathParameters: any = {};
    log.debug("key path number", i);
    for (let key in inputKeyPathsParameters) {
      // Set parameters for 'i' key path
      if (typeof inputKeyPathsParameters[key] !== "object")
        pathParameters[key] = inputKeyPathsParameters[key];
      else {
        if (inputKeyPathsParameters[key].length === numOfKeyPaths)
          pathParameters[key] = inputKeyPathsParameters[key][i];
        else if (typeof inputKeyPathsParameters[key][i] === "number")
          pathParameters[key] = getValueFromRange(
            inputKeyPathsParameters[key],
            numOfKeyPaths,
            i
          );
        else throw `Wrong '${key}' parameter array at ${i} key path`;
      }
    }
    log.debug("generated parameters", pathParameters);
    paths[i] = generateShapes(pathParameters);
    log.debug("generated path", paths[i]);
  }
}
