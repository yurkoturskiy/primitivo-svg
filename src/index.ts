// Layers
import pathLayer from "./path/index";
import morphingLayer from "./morphing/index";
import spacingLayer from "./spacing/index";
import phasesLayer from "./phases/index";
// Misc
import { randomRange as miscRandomRange } from "./misc/index";
// Interfaces
import { InputParameters, PathData } from "./path/interfaces";
import { AnimateParameters, KeyPathParameters } from "./morphing/interfaces";

///////////////////
// Logging setup //
var log = require("loglevel");
log.setLevel("warn");
log.getLogger("path-log").setLevel("warn");
log.getLogger("phases-log").setLevel("warn");
log.getLogger("spacing-log").setLevel("warn");

////////////
// Layers //
export const path = (parameters: any): PathData => pathLayer(parameters);

export const morphing = (animateParameters: any, keyPathsParameters?: any) =>
  morphingLayer(animateParameters, keyPathsParameters);

export const spacing = (parameters: any) => spacingLayer(parameters);

export const phases = (parameters: any) => phasesLayer(parameters);

////////////////////
// Misc functions //
export const randomRange = (min: number, max: number): number =>
  miscRandomRange(min, max);
