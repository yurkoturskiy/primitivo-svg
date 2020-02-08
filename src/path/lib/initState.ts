import defaultParameters from "./defaultParameters";
import { pipe } from "ramda";
// Interfaces
import { PathData, InputParameters } from "../interfaces";

const setDefaultParams = (parameters: InputParameters): InputParameters => ({
  ...defaultParameters,
  ...parameters,
  numOfGroups: parameters.groups.length,
  groups: parameters.groups.map(group => ({
    ...defaultParameters.groups[0],
    ...group
  }))
});

const createPath = (parameters: InputParameters): PathData => ({
  parameters
});

const initState = pipe(setDefaultParams, createPath);

export default initState;
