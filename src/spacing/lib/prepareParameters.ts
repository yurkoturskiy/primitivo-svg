import { Parameters } from "../interfaces";
import { update } from "ramda";
import { pipe } from "fp-ts/lib/pipeable";
var log = require("loglevel").getLogger("spacing-log");

const setDefaultKeySplines = (params: Parameters): Parameters =>
  params.keySplines ? params : { ...params, keySplines: "0,0,1,1" };

const initKeyTimesDefaultArray = (numOfKeyTimes: number): number[] =>
  Array(numOfKeyTimes).fill(null, 0, numOfKeyTimes - 1);

const setDefaultKeyTimes = (params: Parameters): Parameters =>
  params.keyTimes
    ? params
    : {
        ...params,
        keyTimes: pipe(
          update(0, 0, initKeyTimesDefaultArray(params.progression.length)),
          update(-1, 1)
        )
      };

const prepareParameters = (params: Parameters): Parameters => {
  params = setDefaultKeySplines(params);
  params = setDefaultKeyTimes(params);

  log.debug(" input progression", params.progression);
  log.debug("input keySplines", params.keySplines);
  log.debug("input keyTimes", params.keyTimes);

  if (typeof params.keySplines === "string") {
    params.keySplines = params.keySplines.split(",");
    if (params.keySplines.length !== 4) throw "Wrong keySplines format";
    let proto = Array((params.progression.length - 1) * 2);
    proto.fill(null, 0, proto.length - 1);
    proto[0] = `${params.keySplines[0]}, ${params.keySplines[1]}`;
    proto[
      proto.length - 1
    ] = `${params.keySplines[2]}, ${params.keySplines[3]}`;
    params.keySplines = proto;
    log.debug("keySplines", params.keySplines);
  }

  if (
    typeof params.keySplines === "object" &&
    params.keySplines.length !== (params.progression.length - 1) * 2
  )
    throw "Amount of keySplines' array items doesn't match the number of progression's items";

  log.debug("parameters", params);
  return params;
};

export default prepareParameters;
