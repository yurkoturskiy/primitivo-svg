import * as log from "loglevel";

export interface Phase {
  duration: number;
  groups: GroupParameters[];
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
