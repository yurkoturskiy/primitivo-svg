import { PathData } from "../interfaces";

const remapVertexes = (path: PathData): PathData => {
  /*
   * Add "M" vertex to the array at the start
   * Move first vertex to the end
   * Set index to each vertex
   */
  const { vertexes } = path;

  vertexes[vertexes.length] = vertexes[0];
  vertexes[0] = { ...vertexes[0], type: "M" };
  const newVertexes = vertexes.map((vertex, index) => ({ ...vertex, index }));
  return { ...path, vertexes: newVertexes };
};

export default remapVertexes;
