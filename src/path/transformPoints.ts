import { pipe } from "fp-ts/lib/pipeable";
// Methods
import setArms from "./lib/setArms";
import scaleToOne from "./lib/scaleToOne";
import setCenter from "./lib/setCenter";
import setDistance from "./lib/setDistance";
import setPosition from "./lib/setPosition";
import setScale from "./lib/setScale";
import setLength from "./lib/setLength";
import recalcRadians from "./lib/recalcRadians";
import shift from "./lib/shift";
import { PathData } from "./interfaces";

const transformPoints = (path: PathData): PathData =>
  pipe(
    scaleToOne(path),
    setCenter,
    setDistance,
    setPosition,
    setScale,
    setLength,
    recalcRadians,
    setArms("adapt"),
    shift
  );

export default transformPoints;
