"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var parseGroupParameter_1 = __importDefault(require("./parseGroupParameter"));
var misc_1 = require("../../misc");
var ramda_1 = require("ramda");
// logging
var log = require("loglevel").getLogger("path-log");
var getAdaptArmsValue = function (group, vertexIndex) {
    var parameter = group.adaptArms;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "boolean")
        throw "Wrong 'adaptArms' parameter in group number " + group.pk;
    else
        return parameter;
};
var getSmartRoundValue = function (group, vertexIndex) {
    var parameter = group.smartRound;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "boolean")
        throw "Wrong 'smartRound' parameter in group number " + group.pk;
    else
        return parameter;
};
var getLengthBasedRoundValue = function (group, vertexIndex) {
    var parameter = group.lengthBasedRound;
    parameter = parseGroupParameter_1.default(parameter, vertexIndex);
    if (!parameter)
        return parameter;
    else if (typeof parameter !== "boolean")
        throw "Wrong 'lengthBasedRound' parameter in group number " + group.pk;
    else
        return parameter;
};
var setArms = function (mode, path) {
    var vertexes = path.vertexes;
    var _a = path.parameters, groups = _a.groups, averageLength = _a.averageLength;
    var numOfPoints = vertexes.length - 1; // Minus "M" vertex
    var averageLength;
    for (var i = 1; i < vertexes.length; i++) {
        // Adapt arms
        var firstArmAdapt = getAdaptArmsValue(groups[vertexes[i - 1].group], vertexes[i - 1].indexWithingGroup);
        var secondArmAdapt = getAdaptArmsValue(groups[vertexes[i].group], vertexes[i].indexWithingGroup);
        if (mode === "init" && firstArmAdapt && secondArmAdapt)
            continue;
        else if (mode === "adapt" && !firstArmAdapt && !secondArmAdapt)
            continue;
        // Prepare vars
        var firstArmLength = void 0, secondArmLength = void 0;
        // Smart round
        var firstArmSmartRound = getSmartRoundValue(groups[vertexes[i - 1].group], vertexes[i - 1].indexWithingGroup);
        var secondArmSmartRound = getSmartRoundValue(groups[vertexes[i].group], vertexes[i].indexWithingGroup);
        // Length based round
        var firstArmLengthBasedRound = getLengthBasedRoundValue(groups[vertexes[i - 1].group], vertexes[i - 1].indexWithingGroup);
        var secondArmLengthBasedRound = getLengthBasedRoundValue(groups[vertexes[i].group], vertexes[i].indexWithingGroup);
        // Calc individual factor for smart round
        var individualFactor = void 0;
        if (firstArmSmartRound || secondArmSmartRound) {
            var distanceRadians = misc_1.radiansDelta(vertexes[i - 1].radians, vertexes[i].radians);
            individualFactor = (2 * Math.PI) / distanceRadians;
        }
        // First arm
        if ((mode === "adapt" && firstArmAdapt) ||
            (mode === "init" && !firstArmAdapt)) {
            // Calc first arm
            log.info("calc first arm. Mode: " + mode);
            var firstArmFactor = firstArmSmartRound ? individualFactor : numOfPoints;
            firstArmLength = (4 / 3) * Math.tan(Math.PI / (2 * firstArmFactor));
            if (mode === "adapt") {
                // Set scale
                var firstArmScaleFactor = firstArmLengthBasedRound
                    ? vertexes[i - 1].length
                    : averageLength;
                firstArmLength *= firstArmScaleFactor;
            }
            // Round
            firstArmLength *= vertexes[i - 1].round[1];
            // Set angle
            var firstArmRadians = vertexes[i - 1].radians + Math.PI / 2; // angle + 90 from the previous point angle
            var firstArmAngle = misc_1.radToAngle(firstArmRadians);
            log.debug("first arm angle", firstArmAngle);
            // Set cos and sin
            var cosx1 = misc_1.round(Math.cos(firstArmRadians));
            if (mode === "adapt")
                cosx1 *= -1;
            var siny1 = misc_1.round(Math.sin(firstArmRadians));
            // Set coordinates
            var x1 = cosx1 * firstArmLength + vertexes[i - 1].x;
            var y1 = siny1 * firstArmLength + vertexes[i - 1].y;
            log.debug("vertex " + i + " first arm x: " + x1 + " y: " + y1);
            // Add to vertex
            vertexes[i] = __assign({}, vertexes[i], { x1: x1,
                y1: y1,
                cosx1: cosx1,
                siny1: siny1 });
        }
        // Second arm
        if ((mode === "adapt" && secondArmAdapt) ||
            (mode === "init" && !secondArmAdapt)) {
            // Calc second arm
            log.info("calc second arm. Mode: " + mode);
            var secondArmFactor = secondArmSmartRound
                ? individualFactor
                : numOfPoints;
            secondArmLength = (4 / 3) * Math.tan(Math.PI / (2 * secondArmFactor));
            if (mode === "adapt") {
                // Set scale
                var secondArmScaleFactor = secondArmLengthBasedRound
                    ? vertexes[i].length
                    : averageLength;
                secondArmLength *= secondArmScaleFactor;
            }
            // Set round
            secondArmLength *= vertexes[i].round[0];
            // Set angle
            var secondArmRadians = vertexes[i].radians - Math.PI / 2; // angle + 90 from cur point
            var secondArmAngle = misc_1.radToAngle(secondArmRadians);
            log.debug("second arm angle", secondArmAngle);
            // Set cos and sin
            var cosx2 = misc_1.round(Math.cos(secondArmRadians));
            if (mode === "adapt")
                cosx2 *= -1;
            var siny2 = misc_1.round(Math.sin(secondArmRadians));
            // Set coordinates
            var x2 = cosx2 * secondArmLength + vertexes[i].x;
            var y2 = siny2 * secondArmLength + vertexes[i].y;
            log.debug("vertex " + i + " second arm x: " + x2 + " y: " + y2);
            // Add to vertex
            vertexes[i] = __assign({}, vertexes[i], { x2: x2,
                y2: y2,
                cosx2: cosx2,
                siny2: siny2 });
        }
    }
    return path;
};
exports.default = ramda_1.curry(setArms);
