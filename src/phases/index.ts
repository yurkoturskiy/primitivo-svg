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
  progressionsPhaseScope(parameters: ProgressionsPhaseScopeMethod): number[];
  progressionsGeneralScope(
    parameters: ProgressionsGeneralScopeMethod
  ): number[];
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
  groups?: GroupParameters[];
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

const phasesLayer = (parameters: InputParameters = defaultParameters) => {
  log.info("run phases layer");
  const startPath = pathLayer(parameters.startPath);
  const endPath = pathLayer(parameters.endPath);
  const { phases } = parameters;
  log.debug("start path", startPath);
  log.debug("end path", endPath);
  const numOfPhases = parameters.phases.length;
  log.debug(`numOfPhases: ${numOfPhases}`);

  var progressionsPhaseScope: number[][] = Array(numOfPhases);
  progressionsPhaseScope.fill([], 0, numOfPhases);

  var progressionsGeneralScope: any = Array(numOfPhases);
  progressionsGeneralScope.fill([], 0, numOfPhases);

  var progressions: number[];

  for (let i = 0; i < parameters.phases.length; i++) {
    // Calc progressionsPhaseScope
    progressionsPhaseScope[i] = parameters.phases[i].progressionsPhaseScope({
      startPath,
      endPath
    });
    // Calc progressionsGeneralScope
    const duration = parameters.phases[i].duration;
    const prevPhaseProgressions = i && progressionsGeneralScope[i - 1];
    progressionsGeneralScope[i] = parameters.phases[i].progressionsGeneralScope(
      { startPath, endPath, duration, prevPhaseProgressions }
    );
  }

  log.debug("progressions phase scope", progressionsPhaseScope);
  log.debug("progressions general scope", progressionsGeneralScope);

  // Calc progressions
  progressions = progressionsGeneralScope.flat();
  // Sort
  progressions = progressions.sort((a, b) => a - b);
  // Remove dublicates
  let i = 0;
  while (i < progressions.length) {
    if (progressions[i - 1] === progressions[i]) progressions.splice(i, 1);
    else i += 1;
  }

  log.debug("progressions", progressions);

  for (let progression of progressions) {
    log.debug("progression", progression);
    endPath.vertexes.forEach((keyVertex, vertexIndex) => {
      for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
        let phaseIsActive =
          progressionsGeneralScope[phaseIndex][vertexIndex] >= progression;

        log.debug(
          `vertex #${vertexIndex} Phase #${phaseIndex} is ${phaseIsActive}`
        );

        if (!phaseIsActive) continue;

        for (let key in phases[phaseIndex].parameters) {
          if (key !== "groups") {
            let method = phases[phaseIndex].parameters[key];
            let value = method({ startPath, endPath, vertexIndex });
            log.debug(`vertex #${vertexIndex}; ${key}: ${value}`);
          }
        }

        if (phaseIsActive) break;
      }
    });
  }
  log.info("end phases layer");
};

export default phasesLayer;
