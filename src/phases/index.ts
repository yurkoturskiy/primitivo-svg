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

const generateGroupsParameters = (data: Data): Data => {
  // Set groups parameters for each progression and each vertex
  const {
    endPath,
    startPath,
    progressions,
    progressionsGeneralScope,
    progressionsPhaseScope
  } = data;
  const { phases } = data.parameters;
  const numOfPhases = phases.length;

  var pathsGroupsParameters: GroupParameters[][] = Array(progressions.length);

  for (let prIndex = 0; prIndex < progressions.length; prIndex++) {
    pathsGroupsParameters[prIndex] = [];
    endPath.vertexes.forEach((vertex, vIndex) => {
      const gIndex = vertex.group;
      const { indexWithingGroup } = vertex;

      // loop vertexes
      var activePhaseIndex;
      var keyVertexIndex;
      for (let phIndex = 0; phIndex < numOfPhases; phIndex++) {
        // loop phases and pick first incomplete phase to take values from
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
                progression: progressions[prIndex],
                activePhaseIndex,
                progressionsGeneralScope,
                progressionsPhaseScope
              });

        if (pathsGroupsParameters[prIndex][gIndex][key] === undefined)
          pathsGroupsParameters[prIndex][gIndex][key] = [];

        pathsGroupsParameters[prIndex][gIndex][key][indexWithingGroup] = value;
      }
    });
  }
  log.debug("paths groups parameters", pathsGroupsParameters);
  return { ...data, pathsGroupsParameters };
};
import calcProgressions from "./lib/calcProgressions";

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
