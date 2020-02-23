import { pipe } from "fp-ts/lib/pipeable";
import pathLayer from "../path/index";
import morphingLayer from "../morphing/index";
var log = require("loglevel").getLogger("phases-log");

// Path interfaces
import {
  PathData,
  InputParameters as PathInputParameters,
  GroupParameters,
  Vertex
} from "../path/interfaces";

// Interfaces
import {
  InputParameters,
  Data,
  Phase,
  BaseParameters,
  PhaseGroupParameters,
  GroupParameterMethod,
  ProgressionsPhaseScopeMethod,
  ProgressionsGeneralScopeMethod
} from "./interfaces";

// Defaults
import defaultParameters from "./defaultParameters";
// Methods
import setParameters from "./lib/setParameters";
import generateOuterPaths from "./lib/generateOuterPaths";
import calcProgressions from "./lib/calcProgressions";
import generateGroupsParameters from "./lib/generateGroupsParameters";

const generateDValues = (data: Data): Data => {
  log.info("start generate d values");
  const {
    loop,
    baseParameters,
    startGroupsParameters,
    endGroupsParameters
  } = data.parameters;
  const { pathsGroupsParameters } = data;
  const morphingParams = {
    numOfKeyPaths: pathsGroupsParameters.length + 1,
    loop
  };
  log.debug("morphing params", morphingParams);
  // data.progressions.push(1);
  data.progressions.unshift(0);
  const pathsParams = {
    ...baseParameters,
    groups: [startGroupsParameters, ...pathsGroupsParameters]
  };
  log.debug("paths parameters", pathsParams);
  data.dValues = morphingLayer(morphingParams, pathsParams).dValues;
  return data;
};

const phasesLayer = (parameters: InputParameters = defaultParameters): Data =>
  pipe(
    setParameters(parameters),
    generateOuterPaths,
    calcProgressions,
    generateGroupsParameters,
    generateDValues
  );

export default phasesLayer;
