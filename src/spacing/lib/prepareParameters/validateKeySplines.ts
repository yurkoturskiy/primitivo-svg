import { Parameters } from "../../interfaces";

const validateKeySplines = (params: Parameters): Parameters => {
  if (
    typeof params.keySplines === "object" &&
    params.keySplines.length !== (params.progression.length - 1) * 2
  )
    throw "Amount of keySplines' array items doesn't match the number of progression's items";
  return params;
};

export default validateKeySplines;
