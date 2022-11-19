import { pipe } from "fp-ts/lib/function";
// Interfaces
import { InputParameters, Data } from "./interfaces";
// Defaults
import defaultParameters from "./defaultParameters";
// Methods
import setParameters from "./lib/setParameters";
import generateOuterPaths from "./lib/generateOuterPaths";
import calcProgressions from "./lib/calcProgressions";
import generateGroupsParameters from "./lib/generateGroupsParameters";
import generateDescription from "./lib/generateDescription";

const phasesLayer = (parameters: InputParameters = defaultParameters): Data =>
  pipe(
    setParameters(parameters),
    generateOuterPaths,
    calcProgressions,
    generateGroupsParameters,
    generateDescription
  );

export default phasesLayer;
