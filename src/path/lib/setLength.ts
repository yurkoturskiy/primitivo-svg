import { PathData } from "../interfaces";
import { pipe } from "fp-ts/lib/function";
import calcLength from "./calcLength";

// logging
var log = require("loglevel").getLogger("path-log");

const setLength = (path: PathData): PathData => {
  log.info("set length");
  const { parameters, vertexes } = path;
  const { groups } = path.parameters;

  const calcFactor = (newRadius: number, radius: number): number => {
    if (newRadius === 0 || radius === 0) return 0;
    return newRadius / radius;
  };
  path.vertexes = vertexes.map((vertex, i) => {
    // Calc factor
    let factor = vertex.radius ? calcFactor(vertex.radius, vertex.length) : 1;
    // Set length
    vertex.x = (vertex.x - parameters.centerX) * factor + parameters.centerX;
    vertex.y = (vertex.y - parameters.centerY) * factor + parameters.centerY;
    if (vertex.type === "C") {
      let prevFactor = vertexes[i - 1].radius
        ? calcFactor(vertexes[i - 1].radius, vertexes[i - 1].length)
        : 1;
      vertex.x1 =
        (vertex.x1 - parameters.centerX) * prevFactor + parameters.centerX;
      vertex.y1 =
        (vertex.y1 - parameters.centerY) * prevFactor + parameters.centerY;
      vertex.x2 =
        (vertex.x2 - parameters.centerX) * factor + parameters.centerX;
      vertex.y2 =
        (vertex.y2 - parameters.centerY) * factor + parameters.centerY;
    }
    return vertex;
  });
  log.debug(path);
  return path;
};

export default (path: PathData): PathData =>
  pipe(calcLength(path), setLength, calcLength);
