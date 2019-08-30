import * as log from "loglevel";
import pathLayer from "../path/index";

export interface InputParameters {
  phases: Phase[];
}

export interface Phase {
  duration: number;
  parameters: PhaseParameters[];
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

log.setLevel("debug");
const phasesLayer = (parameters: InputParameters) => {
  log.info("start phases layer");
  var endPath;
};

export default phasesLayer;
