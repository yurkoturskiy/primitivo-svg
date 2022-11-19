import { pipe } from "fp-ts/lib/function";
// Interfaces
import { Parameters, Spacing } from "./interfaces";
// misc functions
import prepareParameters from "./lib/prepareParameters";
import calcKeySplines from "./lib/calcKeySplines";
import transformSplines from "./lib/transformSplines";

const spacingLayer = (parameters: Parameters): Spacing =>
  pipe(prepareParameters(parameters), calcKeySplines, transformSplines);

export default spacingLayer;
