import pathLayer from "../path/index";
var log = require("loglevel").getLogger("phases-log");
// interfaces
import {
  PathData,
  InputParameters as PathInputParameters,
  GroupParameters,
  Vertex
} from "../path/interfaces";
// Defaults
import defaultParameters from "./defaultParameters";

export interface InputParameters {
  startGroupsParameters: GroupParameters[];
  endGroupsParameters: GroupParameters[];
  baseParameters: BaseParameters;
  phases?: Phase[];
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
  type?(): string; // type value for a group
  incircle?(): boolean;
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

  ////////////////////////////////
  // Create start and end paths //
  const {
    baseParameters,
    startGroupsParameters,
    endGroupsParameters
  } = parameters;
  const startPath = pathLayer({
    ...baseParameters,
    groups: startGroupsParameters
  });
  const endPath = pathLayer({ ...baseParameters, groups: endGroupsParameters });
  log.debug("start path", startPath);
  log.debug("end path", endPath);

  const { phases } = parameters;
  const numOfPhases = parameters.phases.length;
  log.debug(`numOfPhases: ${numOfPhases}`);

  ///////////////////////
  // Calc Progressions //
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

  ////////////////////////////////////////////////////////////////
  // Set groups parameters for each progression and each vertex //
  var pathsGroupsParameters: GroupParameters[][] = Array(progressions.length);
  for (let prIndex = 0; prIndex < progressions.length; prIndex++) {
    pathsGroupsParameters[prIndex] = [];
    endPath.vertexes.forEach((keyVertex, vIndex) => {
      // loop vertexes
      for (let phIndex = 0; phIndex < phases.length; phIndex++) {
        // loop phases and pick first incoplete phase to take values from

        // Check if current phase is incomplete
        let phaseIsIncomplete =
          progressionsGeneralScope[phIndex][vIndex] >= progressions[prIndex];

        if (!phaseIsIncomplete)
          // Current phase was completed. Switch to next one.
          continue;

        const { groupsParameters } = phases[phIndex];
        for (let gIndex = 0; gIndex < groupsParameters.length; gIndex++) {
          // loop groups
          if (vIndex === 0) pathsGroupsParameters[prIndex][gIndex] = {};
          for (let [key, method] of Object.entries(groupsParameters[gIndex])) {
            // loop group param methods and take values
            let value = method({ startPath, endPath, vIndex });
            if (pathsGroupsParameters[prIndex][gIndex][key] === undefined)
              pathsGroupsParameters[prIndex][gIndex][key] = [];
            pathsGroupsParameters[prIndex][gIndex][key][vIndex] = value;
          }
        }

        if (phaseIsIncomplete)
          // Current phase is the one we need. Break phases loop.
          break;
      }
    });
  }
  log.debug("paths groups parameters", pathsGroupsParameters);
  log.info("end phases layer");
};

export default phasesLayer;
