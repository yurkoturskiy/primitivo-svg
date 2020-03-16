import { Data } from "../interfaces";
// misc
import { getType } from "../../misc/index";
// Layers
import pathLayer from "../../path/index";
// Logging
var log = require("loglevel").getLogger("phases-log");

const getValueFromRange = (
  values: number[],
  numOfKeyPaths: number,
  index: number
) => {
  let min: number = Math.min(...values);
  let max: number = Math.max(...values);
  return ((max - min) / numOfKeyPaths) * index + min;
};

const generateDValues = (data: Data): Data => {
  log.info("start generate d values");
  const { numOfKeyPaths, loop } = data.parameters;
  let inputKeyPathsParameters: any = data.keyPathsParameters; // Maybe need to refactor
  let paths = [];
  let dValuesFrames: string[] | string = [];
  for (let i = 0; i < numOfKeyPaths; i++) {
    log.info(`generate key path number ${i}`);
    var pathParameters: any = {};
    for (let key in inputKeyPathsParameters) {
      // Set parameters for 'i' key path
      if (key === "groups") {
        if (getType(inputKeyPathsParameters[key][0]) === "object")
          // One setup for all key paths groups
          pathParameters[key] = inputKeyPathsParameters[key];
        else pathParameters[key] = inputKeyPathsParameters[key][i];
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
    let path = pathLayer(pathParameters);
    paths[i] = path;
    dValuesFrames[i] = path.d;
    if (loop) {
      if (loop === "linear" && i !== numOfKeyPaths - 1) {
        // Linear or boomerang loop
        dValuesFrames[(numOfKeyPaths - 1) * 2 - i] = path.d;
      } else if (loop === "circle" && i === numOfKeyPaths - 1) {
        // Circle loop. Last path equal to first
        dValuesFrames[numOfKeyPaths] = dValuesFrames[0];
      }
    }
  }
  const dValues = dValuesFrames.join(";");
  return { ...data, dValues, dValuesFrames };
};

export default generateDValues;
