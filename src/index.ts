// Layers
import pathLayer from "./path/index";
import morphingLayer from "./morphing/index";
import spacingLayer from "./spacing/index";
// Interfaces
import { Parameters, PathData } from "./path/interfaces";
import { AnimateParameters, KeyPathParameters } from "./morphing/interfaces";

import * as log from "loglevel";

log.setLevel("info");

export const path = (parameters: any): PathData => pathLayer(parameters);

export const morphing = (animateParameters: any, keyPathsParameters: any) =>
  morphingLayer(animateParameters, keyPathsParameters);

export const spacing = (parameters: any) => spacingLayer(parameters);
