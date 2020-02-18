import { PathData } from "../interfaces";
import { radToAngle } from "../../misc/index";

// logging
var log = require("loglevel").getLogger("path-log");

const recalcRadians = (path: PathData): PathData => {
  log.info("recalculate radians");
  const { vertexes } = path;
  const { centerX, centerY } = path.parameters;
  path.vertexes = vertexes.map(vertex => {
    let deltaX = vertex.x - centerX;
    let deltaY = centerY - vertex.y;
    vertex.radians = Math.atan2(deltaY, deltaX);
    vertex.angle = radToAngle(vertex.radians);
    return vertex;
  });
  return path;
};

export default recalcRadians;
