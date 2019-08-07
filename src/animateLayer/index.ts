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
): string {
  /*
   * Generate paths and return string for values option of animate tag.
   * Example:
   *   <animate values={values} ... />
   *
   * Figure out first how pathLayer works.
   */

  let inputKeyPathsParameters: any = keyPathsParameters; // Maybe need to refactor
  let paths = [];
  let ds = [];
  for (let i = 0; i < numOfKeyPaths; i++) {
    var pathParameters: any = {};
    for (let key in inputKeyPathsParameters) {
      // Set parameters for 'i' key path
      if (typeof inputKeyPathsParameters[key] !== "object")
        // if one value for all paths
        pathParameters[key] = inputKeyPathsParameters[key];
      else {
        if (inputKeyPathsParameters[key].length === numOfKeyPaths)
          // if individual values for each path
          pathParameters[key] = inputKeyPathsParameters[key][i];
        else if (typeof inputKeyPathsParameters[key][i] === "number")
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
    ds[i] = path.d;
  }
  var values: string = ds.join(";");
  return values;
}
