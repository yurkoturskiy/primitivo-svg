import { PathData } from "../interfaces";

const setCenter = (path: PathData): PathData => {
  const { parameters } = path;
  const factorX = 1 - parameters.centerX / (parameters.width / 2);
  const factorY = 1 - parameters.centerY / (parameters.height / 2);
  path.vertexes = path.vertexes.map(vertex => {
    vertex.x += factorX;
    vertex.y += factorY;
    if (vertex.type === "C") {
      vertex.x1 += factorX;
      vertex.x2 += factorX;
      vertex.y1 += factorY;
      vertex.y2 += factorY;
    }
    return vertex;
  });
  return path;
};

export default setCenter;
