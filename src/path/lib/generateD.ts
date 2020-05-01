import { PathData } from "../interfaces";

const generateD = (path: PathData): PathData => {
  path.vertexes = path.vertexes.map((vertex) => {
    switch (vertex.type) {
      case "M":
        vertex.d = `${vertex.type} ${vertex.x} ${vertex.y}`;
        break;
      case "C":
        vertex.d = `${vertex.type}\n${vertex.x1} ${vertex.y1},\n${vertex.x2} ${vertex.y2},\n${vertex.x} ${vertex.y}`;
        break;
      default:
        vertex.d = ``;
    }
    return vertex;
  });
  var d = "";
  path.vertexes.forEach((vertex, i) => {
    d += vertex.d + "\n";
  });
  d += "Z";
  path.d = d;
  return path;
};

export default generateD;
