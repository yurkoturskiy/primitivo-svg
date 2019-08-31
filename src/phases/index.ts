import pathLayer from "../path/index";
var log = require("loglevel").getLogger("phases-log");
// interfaces
import { InputParameters as PathInputParameters } from "../path/interfaces";
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
  numOfSegments?(): number;
  depth?(): number;
  x?(): number;
  y?(): number;
  width?(): number;
  height?(): number;
  centerX?(): number;
  centerY?(): number;
  rotate?(): number;
  numOfGroups?(): number;
  incircle?(): boolean;
  groups?(): GroupParameters[];
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

const phasesLayer = (parameters: InputParameters = defaultParameters) => {
  log.info("run phases layer");
  const startPath = pathLayer(parameters.startPath);
  const endPath = pathLayer(parameters.endPath);
  log.debug("start path", startPath);
  log.debug("end path", endPath);
};

export default phasesLayer;
