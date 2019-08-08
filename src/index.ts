// Layers
import generateShapes from "./pathLayer/index";
import animate from "./animateLayer/index";
// Interfaces
import { Parameters, PathData } from "./pathLayer/interfaces";
import {
  AnimateParameters,
  KeyPathParameters
} from "./animateLayer/interfaces";

export const pathLayer = (parameters: any): PathData =>
  generateShapes(parameters);

export const animateLayer = (animateParameters: any, keyPathsParameters: any) =>
  animate(animateParameters, keyPathsParameters);
