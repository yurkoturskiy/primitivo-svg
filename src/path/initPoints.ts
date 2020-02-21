import { pipe } from "fp-ts/lib/pipeable";
import { PathData } from "./interfaces";
import generateVertexes from "./lib/generateVertexes";
import remapVertexes from "./lib/remapVertexes";
import setArms from "./lib/setArms";

const initPoints = (path: PathData): PathData =>
  pipe(generateVertexes(path), remapVertexes, setArms("init"));

export default initPoints;
