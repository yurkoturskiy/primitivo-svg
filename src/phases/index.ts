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
