// Interfaces
import { Data } from "../interfaces";
// Path interfaces
import { GroupParameters } from "../../path/interfaces";

var log = require("loglevel").getLogger("phases-log");

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

export default generateGroupsParameters;
