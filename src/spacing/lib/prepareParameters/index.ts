import { Parameters } from "../../interfaces";
import { pipe } from "fp-ts/lib/pipeable";

import setDefaultKeySplines from "./setDefaultKeySplines";
import setDefaultKeyTimes from "./setDefaultKeyTimes";
import prepareKeySplines from "./prepareKeySplines";
import validateKeySplines from "./validateKeySplines";

const prepareParameters = (params: Parameters): Parameters =>
  pipe(
    setDefaultKeySplines(params),
    setDefaultKeyTimes,
    prepareKeySplines,
    validateKeySplines
  );

export default prepareParameters;
