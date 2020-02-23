import morphingLayer from "../../morphing/index";

// Interfaces
import { Data } from "../interfaces";
// Logging
var log = require("loglevel").getLogger("phases-log");

const generateDescription = (data: Data): Data => {
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

export default generateDescription;
