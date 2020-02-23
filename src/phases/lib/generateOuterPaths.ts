import pathLayer from "../../path";
import { Data } from "../interfaces";
var log = require("loglevel").getLogger("phases-log");

const generateOuterPaths = (data: Data): Data => {
  ////////////////////////////////
  // Create start and end paths //
  const {
    baseParameters,
    startGroupsParameters,
    endGroupsParameters
  } = data.parameters;
  data.startPath = pathLayer({
    ...baseParameters,
    groups: startGroupsParameters
  });

  data.endPath = pathLayer({ ...baseParameters, groups: endGroupsParameters });
  log.debug("start path", data.startPath);
  log.debug("end path", data.endPath);
  return data;
};

export default generateOuterPaths;
