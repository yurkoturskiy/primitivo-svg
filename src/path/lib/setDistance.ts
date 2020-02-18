import { PathData } from "../interfaces";

const setDistance = (path: PathData): PathData => {
  var { vertexes } = path;
  var { groups } = path.parameters;
  path.vertexes = path.vertexes.map((vertex, index) => {
    // Setup distance
    vertex.x *= vertex.distance;
    vertex.y *= vertex.distance;
    if (vertex.type === "C") {
      // Setup distance
      vertex.x1 *= vertexes[index - 1].distance;
      vertex.y1 *= vertexes[index - 1].distance;
      vertex.x2 *= vertex.distance;
      vertex.y2 *= vertex.distance;
    }
    return vertex;
  });
  return path;
};

export default setDistance;
