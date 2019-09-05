// Path interfaces
import {
  PathData,
  InputParameters as PathInputParameters,
  GroupParameters,
  Vertex
} from "../path/interfaces";

export interface InputParameters {
  loop: boolean;
  startGroupsParameters: GroupParameters[];
  endGroupsParameters: GroupParameters[];
  baseParameters: BaseParameters;
  phases?: Phase[];
}

export interface Data {
  parameters: InputParameters;
  startPath?: PathData;
  endPath?: PathData;
  progressions?: Progression[];
  progressionsGeneralScope?: number[][];
  progressionsPhaseScope?: number[][];
  pathsGroupsParameters?: GroupParameters[][];
  dValues?: string;
}

export interface Phase {
  duration: number;
  progressionsPhaseScope(parameters: ProgressionsPhaseScopeMethod): number[];
  progressionsGeneralScope(
    parameters: ProgressionsGeneralScopeMethod
  ): number[];
  groupsParameters: PhaseGroupParameters[];
}

export interface BaseParameters {
  numOfSegments?: number;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  rotate?: number;
  numOfGroups?: number;
}

export interface PhaseGroupParameters {
  // Part of Parameters
  [key: string]: any;
  type?(params: GroupParameterMethod): string; // type value for a group
  incircle?(params: GroupParameterMethod): boolean;
  distance?(params: GroupParameterMethod): number; // return a value for a single vertex
  round?(params: GroupParameterMethod): number; // return a value for a single vertex
  smartRound?(params: GroupParameterMethod): boolean; // value for a group
  lengthBasedRound?(params: GroupParameterMethod): boolean; // value for a group
  adaptArms?(params: GroupParameterMethod): boolean; // Keep arms always perpendicular to center
  radius?(params: GroupParameterMethod): number; // return a radius of a single vertex
  radians?(params: GroupParameterMethod): number; // Custom radians for each point of a group
}

export interface GroupParameterMethod {
  startPath: PathData;
  endPath: PathData;
  vertex: Vertex;
  progression: Progression;
  progressionsGeneralScope: number[][];
  progressionsPhaseScope: number[][];
  activePhaseIndex: number;
  phasesDuration: number[];
}

export interface ProgressionsPhaseScopeMethod {
  startPath: PathData;
  endPath: PathData;
}

export interface ProgressionsGeneralScopeMethod {
  startPath: PathData;
  endPath: PathData;
  duration: number;
  prevPhaseProgressions: number[];
}

export interface Progression {
  keyVertexIndex: number;
  phaseIndex: number;
  generalScope: number;
  phaseScope: number;
}
