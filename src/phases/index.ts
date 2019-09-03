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
  progressionsPhaseScope: number[];
  progressionsGeneralScope: number[];
  progression: number;
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
    endPath.vertexes.forEach((vertex, vIndex) => {
      const gIndex = vertex.group;
      const { indexWithingGroup } = vertex;

      // loop vertexes
      var activePhaseIndex;
      for (let phIndex = 0; phIndex < phases.length; phIndex++) {
        // loop phases and pick first incoplete phase to take values from

        // Check if current phase is incomplete
        let phaseIsIncomplete =
          progressions[prIndex] <= progressionsGeneralScope[phIndex][vIndex];

        if (phaseIsIncomplete) {
          // Current phase is the one we need. Break phases loop.
          const { groupsParameters } = phases[phIndex];
          activePhaseIndex = phIndex;
          break;
        }
      }

      if (pathsGroupsParameters[prIndex][gIndex] === undefined)
        pathsGroupsParameters[prIndex][gIndex] = {};

      var parametersSource =
        // If activePhaseIndex is undefined set previous progression values as a source
        activePhaseIndex === undefined
          ? pathsGroupsParameters[prIndex - 1][gIndex]
          : phases[activePhaseIndex].groupsParameters[gIndex];

      for (let [key, source] of Object.entries(parametersSource)) {
        // loop group param methods and take values

        let value =
          // If activePhaseIndex is undefined take value from previus progression
          activePhaseIndex === undefined
            ? source[indexWithingGroup]
            : source({
                startPath,
                endPath,
                vertex,
                progressionsGeneralScope:
                  progressionsGeneralScope[activePhaseIndex],
                progressionsPhaseScope:
                  progressionsPhaseScope[activePhaseIndex],
                progression: progressions[prIndex]
              });

        if (pathsGroupsParameters[prIndex][gIndex][key] === undefined)
          pathsGroupsParameters[prIndex][gIndex][key] = [];

        pathsGroupsParameters[prIndex][gIndex][key][indexWithingGroup] = value;
      }
    });
  }
  log.debug("paths groups parameters", pathsGroupsParameters);
  log.info("end phases layer");
};

export default phasesLayer;
