import pathLayer from "../path/index";
var log = require("loglevel").getLogger("phases-log");
// interfaces
import {
  PathData,
  InputParameters as PathInputParameters,
  Vertex
} from "../path/interfaces";
// Defaults
import defaultParameters from "./defaultParameters";

export interface InputParameters {
  startPath: PathInputParameters;
  endPath: PathInputParameters;
  phases?: Phase[];
}

export interface Phase {
  duration: number;
  parameters: PhaseParameters;
}

export interface PhaseParameters {
  [key: string]: any;
  numOfSegments?(parameters: PhaseParameterMethod): number;
  depth?(parameters: PhaseParameterMethod): number;
  x?(parameters: PhaseParameterMethod): number;
  y?(parameters: PhaseParameterMethod): number;
  width?(parameters: PhaseParameterMethod): number;
  height?(parameters: PhaseParameterMethod): number;
  centerX?(parameters: PhaseParameterMethod): number;
  centerY?(parameters: PhaseParameterMethod): number;
  rotate?(parameters: PhaseParameterMethod): number;
  numOfGroups?(parameters: PhaseParameterMethod): number;
  incircle?(parameters: PhaseParameterMethod): boolean;
  groups?(parameters: PhaseParameterMethod): GroupParameters[];
}

export interface GroupParameters {
  // Part of Parameters
  type?(): string; // type value for a group
  distance?(): number; // return a value for a single vertex
  round?(): number; // return a value for a single vertex
  smartRound?(): boolean; // value for a group
  lengthBasedRound?(): boolean; // value for a group
  adaptArms?(): boolean; // Keep arms always perpendicular to center
  radius?(): number; // return a radius of a single vertex
  radians?(): number; // Custom radians for each point of a group
}

export interface PhaseParameterMethod {
  startPath: PathData;
  endPath: PathData;
  index: number;
}

const phasesLayer = (parameters: InputParameters = defaultParameters) => {
  log.info("run phases layer");
  const startPath = pathLayer(parameters.startPath);
  const endPath = pathLayer(parameters.endPath);
  log.debug("start path", startPath);
  log.debug("end path", endPath);
  const numOfPhases = parameters.phases.length;
  log.debug(`numOfPhases: ${numOfPhases}`);
  endPath.vertexes.forEach((keyVertex, index) => {
    for (let i = 0; i < parameters.phases.length; i++) {
      for (let key in parameters.phases[i].parameters) {
        let method = parameters.phases[i].parameters[key];
        let value = method({ startPath, endPath, index });
        log.debug(`vertex #${index}; phase #${i}; ${key}: ${value}`);
      }
    }
  });
  log.info("end phases layer");
};

export default phasesLayer;
