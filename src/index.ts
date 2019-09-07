// Layers
import pathLayer from "./path/index";
import morphingLayer from "./morphing/index";
import spacingLayer from "./spacing/index";
import phasesLayer from "./phases/index";
// Interfaces
import { InputParameters, PathData } from "./path/interfaces";
import { AnimateParameters, KeyPathParameters } from "./morphing/interfaces";

var log = require("loglevel");
log.setLevel("warn");
log.getLogger("phases-log").setLevel("info");
log.getLogger("spacing-log").setLevel("debug");

export const path = (parameters: any): PathData => pathLayer(parameters);

export const morphing = (animateParameters: any, keyPathsParameters?: any) =>
  morphingLayer(animateParameters, keyPathsParameters);

export const spacing = (parameters: any) => spacingLayer(parameters);

export const phases = (parameters: any) => phasesLayer(parameters);
