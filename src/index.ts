// Layers
import generateShapes from "./pathLayer/index";
// Interfaces
import { Parameters, PathData } from "./pathLayer/interfaces";

export const pathLayer = (parameters: Parameters): PathData =>
  generateShapes(parameters);
