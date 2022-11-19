import { Parameters } from "../../interfaces";
import { pipe } from "fp-ts/lib/function";
import { update } from "ramda";

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
        ),
      };

export default setDefaultKeyTimes;
