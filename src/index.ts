// Layers
import generateShapes from "./pathLayer/index";
import animate from "./animateLayer/index";
// Interfaces
import { Parameters, PathData } from "./pathLayer/interfaces";
import {
  AnimateParameters,
  KeyPathParameters
} from "./animateLayer/interfaces";

export const pathLayer = (parameters: Parameters): PathData =>
  generateShapes(parameters);

export const animateLayer = (
  animateParameters: AnimateParameters,
  keyPathsParameters: KeyPathParameters
) => animate(animateParameters, keyPathsParameters);
