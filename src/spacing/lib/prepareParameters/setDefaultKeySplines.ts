import { Parameters } from "../../interfaces";

const setDefaultKeySplines = (params: Parameters): Parameters =>
  params.keySplines ? params : { ...params, keySplines: "0,0,1,1" };

export default setDefaultKeySplines;
