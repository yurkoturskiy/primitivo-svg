// Interfaces
import { Data } from "../interfaces";
var log = require("loglevel").getLogger("phases-log");

const calcProgressions = (data: Data): Data => {
  const { parameters, startPath, endPath } = data;
  const numOfPhases = parameters.phases.length;

  var progressionsPhaseScope: number[][] = Array(numOfPhases);
  var progressionsGeneralScope: any = Array(numOfPhases);
  var progressions: number[] = [];
  var durations: number[] = [];

  for (let i = 0; i < numOfPhases; i++) {
    const duration = parameters.phases[i].duration({
      startPath,
      endPath,
      prevDurations: durations
    });
    durations.push(duration);
    // Calc progressionsPhaseScope
    progressionsPhaseScope[i] = parameters.phases[i].progressionsPhaseScope({
      startPath,
      endPath,
      duration
    });
    // Calc progressionsGeneralScope
    const prevPhaseProgressions = i && progressionsGeneralScope[i - 1];
    progressionsGeneralScope[i] = parameters.phases[i].progressionsGeneralScope(
      {
        startPath,
        endPath,
        duration,
        prevPhaseProgressions
      }
    );

    // Form progressions objects
    for (
      let keyVertexIndex = 0;
      keyVertexIndex < progressionsGeneralScope[i].length;
      keyVertexIndex++
    )
      progressions.push(progressionsGeneralScope[i][keyVertexIndex]);
  }

  log.debug("progressions phase scope", progressionsPhaseScope);
  log.debug("progressions general scope", progressionsGeneralScope);

  // Sort progressions objects
  progressions = progressions.sort((a: number, b: number) => a - b);

  // Remove dublicates
  let i = 1;
  while (i < progressions.length) {
    if (progressions[i - 1] === progressions[i]) progressions.splice(i, 1);
    else i += 1;
  }
  log.debug("progressions", progressions);
  return {
    ...data,
    progressions,
    progressionsGeneralScope,
    progressionsPhaseScope
  };
};

export default calcProgressions;
