// Loglevel setup
import * as log from "loglevel";
log.setLevel("warn");
log.getLogger("path-log").setLevel("warn");
log.getLogger("phases-log").setLevel("warn");
log.getLogger("spacing-log").setLevel("warn");

// Layers
export { default as path } from "./path/index";
export { default as morphing } from "./morphing/index";
export { default as spacing } from "./spacing/index";
export { default as phases } from "./phases/index";

// Misc functions
export {
  // General
  all,
  perVertex,
  randomRangeForAll,
  randomRangeForEach,
  // Vertex scope
  randomRange,
  perArm,
} from "./misc/index";
