import { pipe } from "fp-ts/lib/pipeable";
import defaultParameters from "./lib/defaultParameters";
// Interfaces
import { PathData, InputParameters } from "./interfaces";

const setDefaultParams = (parameters: InputParameters): InputParameters => ({
  ...defaultParameters,
  ...parameters,
  numOfGroups: parameters.numOfGroups || parameters.groups.length,
  groups: parameters.groups.map((group, index) => ({
    ...defaultParameters.groups[0],
    ...group,
    pk: index
  }))
});

const createPath = (parameters: InputParameters): PathData => ({
  parameters
});

export default (parameters: InputParameters) =>
  pipe(setDefaultParams(parameters), createPath);
