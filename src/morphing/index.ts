import { pipe } from "fp-ts/lib/pipeable";
// Interfaces
import { AnimateParameters, KeyPathParameters, Data } from "./interfaces";
import defaults from "./defaultParameters";
import setDefaults from "./lib/setDefaults";
import generateDValues from "./lib/generateDValues";

/**
 * Generate paths and return string for values option of animate tag.
 * Example:
 *   <animate values={values} ... />
 *
 * Figure out first how pathLayer works.
 */

const morphingLayer = (
  parameters: AnimateParameters = defaults.parameters,
  keyPathsParameters: KeyPathParameters = defaults.keyPathsParameters
): Data => pipe(setDefaults(parameters, keyPathsParameters), generateDValues);

export default morphingLayer;
