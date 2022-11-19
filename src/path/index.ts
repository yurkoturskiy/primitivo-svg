import { pipe } from "fp-ts/lib/function";
// Interfaces
import { PathData, InputParameters } from "./interfaces";
// Methods
import initState from "./initState";
import setFrame from "./setFrame";
import initPoints from "./initPoints";
import transformPoints from "./transformPoints";
import generateD from "./lib/generateD";

export default (parameters: InputParameters): PathData =>
  pipe(initState(parameters), setFrame, initPoints, transformPoints, generateD);
