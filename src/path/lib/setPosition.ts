import { PathData } from "../interfaces";

const setPosition = (path: PathData): PathData => {
  const { parameters } = path;
  var factorX = parameters.centerX / (parameters.width / 2);
  var factorY = parameters.centerY / (parameters.height / 2);
  path.frame.vertexes = path.frame.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    return vertex;
  });
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    if (vertex.type === "C") {
      vertex.x1 += factorX;
      vertex.y1 += factorY;
      vertex.x2 += factorX;
      vertex.y2 += factorY;
    }
    return vertex;
  });
  return path;
};

export default setPosition;
