import { randomRange } from "../../misc/index";

const parseGroupParameter = (parameter: any, vertexIndex: number): number => {
  /* Parse distance, round, or radius group parameters */

  // Number for all
  if (typeof parameter !== "object") return parameter;
  // Random for all
  if (typeof parameter === "object" && parameter.length === 2)
    return randomRange(parameter[0], parameter[1]);
  // Distance per vertex
  if (typeof parameter === "object") {
    parameter = parameter[vertexIndex];
    // Number
    if (typeof parameter !== "object") return parameter;
    // Random range
    if (typeof parameter === "object" && parameter.length === 2)
      return randomRange(parameter[0], parameter[1]);
  }
  return parameter;
};

export default parseGroupParameter;
