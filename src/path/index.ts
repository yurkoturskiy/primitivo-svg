// Interfaces
import { PathData, InputParameters } from "./interfaces";
// Methods
import defaultParameters from "./lib/defaultParameters";
import initState from "./lib/initState";
import setFrame from "./lib/setFrame";
import generateVertexes from "./lib/generateVertexes";
import remapVertexes from "./lib/remapVertexes";
import setArms from "./lib/setArms";
import scaleToOne from "./lib/scaleToOne";
import setCenter from "./lib/setCenter";
import setDistance from "./lib/setDistance";
import setPosition from "./lib/setPosition";
import setScale from "./lib/setScale";
import calcLength from "./lib/calcLength";
import setLength from "./lib/setLength";
import recalcRadians from "./lib/recalcRadians";
import shift from "./lib/shift";
import generateD from "./lib/generateD";

const pathLayer = (
  parameters: InputParameters = defaultParameters
): PathData => {
  // Setup defaults
  let path = initState(parameters);
  // Generate shape
  path = setFrame(path);
  path = generateVertexes(path);
  path = remapVertexes(path); // Add M point
  path = setArms("init", path);

  path = scaleToOne(path);
  path = setCenter(path);
  path = setDistance(path);
  path = setPosition(path);
  path = setScale(path);
  path = calcLength(path);
  path = setLength(path);
  path = calcLength(path);
  path = recalcRadians(path);
  path = setArms("adapt", path);
  path = shift(path);
  path = generateD(path);
  return path;
};

export default pathLayer;
