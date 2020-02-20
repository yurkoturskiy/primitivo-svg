import { PathData, GroupParameters } from "../interfaces";
import parseGroupParameter from "./parseGroupParameter";
import { radiansDelta, radToAngle, round } from "../../misc";
import { curry } from "ramda";

// logging
const log = require("loglevel").getLogger("path-log");

const getAdaptArmsValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.adaptArms;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'adaptArms' parameter in group number ${group.pk}`;
  else return parameter;
};

const getSmartRoundValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.smartRound;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'smartRound' parameter in group number ${group.pk}`;
  else return parameter;
};

const getLengthBasedRoundValue = (
  group: GroupParameters,
  vertexIndex: number
): boolean => {
  let parameter: any = group.lengthBasedRound;
  parameter = parseGroupParameter(parameter, vertexIndex);
  if (!parameter) return parameter;
  else if (typeof parameter !== "boolean")
    throw `Wrong 'lengthBasedRound' parameter in group number ${group.pk}`;
  else return parameter;
};

const setArms = (mode: string, path: PathData): PathData => {
  var { vertexes } = path;
  var { groups, averageLength } = path.parameters;
  var numOfPoints = vertexes.length - 1; // Minus "M" vertex
  var averageLength: number;
  for (let i = 1; i < vertexes.length; i++) {
    // Adapt arms
    let firstArmAdapt = getAdaptArmsValue(
      groups[vertexes[i - 1].group],
      vertexes[i - 1].indexWithingGroup
    );
    let secondArmAdapt = getAdaptArmsValue(
      groups[vertexes[i].group],
      vertexes[i].indexWithingGroup
    );

    if (mode === "init" && firstArmAdapt && secondArmAdapt) continue;
    else if (mode === "adapt" && !firstArmAdapt && !secondArmAdapt) continue;

    // Prepare vars
    let firstArmLength, secondArmLength;
    // Smart round
    let firstArmSmartRound = getSmartRoundValue(
      groups[vertexes[i - 1].group],
      vertexes[i - 1].indexWithingGroup
    );
    let secondArmSmartRound = getSmartRoundValue(
      groups[vertexes[i].group],
      vertexes[i].indexWithingGroup
    );
    // Length based round
    let firstArmLengthBasedRound = getLengthBasedRoundValue(
      groups[vertexes[i - 1].group],
      vertexes[i - 1].indexWithingGroup
    );
    let secondArmLengthBasedRound = getLengthBasedRoundValue(
      groups[vertexes[i].group],
      vertexes[i].indexWithingGroup
    );

    // Calc individual factor for smart round
    let individualFactor;
    if (firstArmSmartRound || secondArmSmartRound) {
      let distanceRadians = radiansDelta(
        vertexes[i - 1].radians,
        vertexes[i].radians
      );
      individualFactor = (2 * Math.PI) / distanceRadians;
    }

    // First arm
    if (
      (mode === "adapt" && firstArmAdapt) ||
      (mode === "init" && !firstArmAdapt)
    ) {
      // Calc first arm
      log.info(`calc first arm. Mode: ${mode}`);
      let firstArmFactor = firstArmSmartRound ? individualFactor : numOfPoints;
      firstArmLength = (4 / 3) * Math.tan(Math.PI / (2 * firstArmFactor));
      if (mode === "adapt") {
        // Set scale
        let firstArmScaleFactor = firstArmLengthBasedRound
          ? vertexes[i - 1].length
          : averageLength;
        firstArmLength *= firstArmScaleFactor;
      }
      // Round
      firstArmLength *= vertexes[i - 1].round[1];
      // Set angle
      let firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
      let firstArmAngle = radToAngle(firstArmRadians);
      log.debug("first arm angle", firstArmAngle);
      // Set cos and sin
      let cosx1 = round(Math.cos(firstArmRadians));
      if (mode === "adapt") cosx1 *= -1;
      let siny1 = round(Math.sin(firstArmRadians));
      // Set coordinates
      let x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
      let y1 = siny1 * firstArmLength + vertexes[i - 1].y;
      log.debug(`vertex ${i} first arm x: ${x1} y: ${y1}`);
      // Add to vertex
      vertexes[i] = {
        ...vertexes[i],
        x1,
        y1,
        cosx1,
        siny1
      };
    }

    // Second arm
    if (
      (mode === "adapt" && secondArmAdapt) ||
      (mode === "init" && !secondArmAdapt)
    ) {
      // Calc second arm
      log.info(`calc second arm. Mode: ${mode}`);
      let secondArmFactor = secondArmSmartRound
        ? individualFactor
        : numOfPoints;
      secondArmLength = (4 / 3) * Math.tan(Math.PI / (2 * secondArmFactor));
      if (mode === "adapt") {
        // Set scale
        let secondArmScaleFactor = secondArmLengthBasedRound
          ? vertexes[i].length
          : averageLength;
        secondArmLength *= secondArmScaleFactor;
      }
      // Set round
      secondArmLength *= vertexes[i].round[0];
      // Set angle
      let secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
      let secondArmAngle = radToAngle(secondArmRadians);
      log.debug("second arm angle", secondArmAngle);
      // Set cos and sin
      let cosx2 = round(Math.cos(secondArmRadians));
      if (mode === "adapt") cosx2 *= -1;
      let siny2 = round(Math.sin(secondArmRadians));
      // Set coordinates
      let x2 = cosx2 * secondArmLength + vertexes[i].x;
      let y2 = siny2 * secondArmLength + vertexes[i].y;
      log.debug(`vertex ${i} second arm x: ${x2} y: ${y2}`);
      // Add to vertex
      vertexes[i] = {
        ...vertexes[i],
        x2,
        y2,
        cosx2,
        siny2
      };
    }
  }
  return path;
};

export default curry(setArms);
