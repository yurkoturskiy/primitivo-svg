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
Object.defineProperty(exports, "__esModule", { value: true });
var log = require("loglevel").getLogger("phases-log");
var phaseOneRatio = 2;
var phaseTwoRatio = 2;
var baseParameters = {
    numOfSegments: 4,
    x: 0,
    y: 0,
    width: 1920,
    height: 937,
    centerX: 1820,
    centerY: 100,
    rotate: 45
};
var startGroupsParameters = [
    {
        incircle: false,
        radius: 2,
        round: 1,
        adaptArms: true,
        smartRound: true
    },
    {
        incircle: false,
        type: "linear",
        radius: 2,
        round: 1,
        adaptArms: true,
        smartRound: true
    }
];
var endGroupsParameters = [
    {
        incircle: false,
        distance: 1,
        round: 0,
        adaptArms: true,
        lengthBasedRound: true
    },
    {
        incircle: false,
        type: "linear",
        distance: 1,
        round: 1,
        adaptArms: false,
        lengthBasedRound: true
    }
];
///////////////
// Phase one //
///////////////
var progressionsPhaseScope = function (params) {
    var numOfVertexes = params.endPath.vertexes.length;
    var progressions = Array(numOfVertexes);
    progressions.fill(1, 0, numOfVertexes);
    return progressions;
};
var progressionsGeneralScope = function (params) {
    var numOfVertexes = params.endPath.vertexes.length;
    var progressions = Array(numOfVertexes);
    progressions.fill(params.duration, 0, numOfVertexes);
    return progressions;
};
var phaseOneDuration = function (_a) {
    var endPath = _a.endPath;
    var _b = endPath.parameters, minLength = _b.minLength, maxLength = _b.maxLength;
    // if (minLength < 200) minLength = 200;
    var duration = minLength / phaseOneRatio;
    duration = 0.5 / (maxLength / duration);
    return duration;
};
var phaseOneRadius = function (_a) {
    var endPath = _a.endPath, progression = _a.progression;
    var maxLength = endPath.parameters.maxLength;
    return maxLength * progression;
};
var phaseOne = {
    duration: phaseOneDuration,
    progressionsPhaseScope: progressionsPhaseScope,
    progressionsGeneralScope: progressionsGeneralScope,
    groupsParameters: [
        {
            incircle: function () { return false; },
            type: function () { return "radial"; },
            radius: phaseOneRadius,
            round: function () { return 1; },
            adaptArms: function () { return true; },
            smartRound: function () { return true; }
        },
        {
            incircle: function () { return false; },
            type: function () { return "linear"; },
            radius: phaseOneRadius,
            round: function () { return 1; },
            adaptArms: function () { return true; },
            smartRound: function () { return true; }
        }
    ]
};
///////////////
// Phase two //
///////////////
var duration = function (_a) {
    var prevDurations = _a.prevDurations;
    return 0.5 - prevDurations[0];
};
var progressionsPhaseScope = function (params) {
    var progressions = [];
    var endPath = params.endPath, duration = params.duration;
    params.endPath.vertexes.forEach(function (vertex, index) {
        var maxLength = endPath.parameters.maxLength;
        var delta = maxLength / vertex.length;
        progressions.push(1 / delta);
    });
    return progressions;
};
var progressionsGeneralScope = function (params) {
    var duration = params.duration, endPath = params.endPath, prevPhaseProgressions = params.prevPhaseProgressions;
    var progressions = [];
    params.endPath.vertexes.forEach(function (vertex, index) {
        var maxLength = endPath.parameters.maxLength;
        var delta = maxLength / vertex.length;
        progressions.push(duration / delta + prevPhaseProgressions[index]);
    });
    return progressions;
};
var radiusFirstGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex, phasesDuration = _a.phasesDuration;
    var maxLength = endPath.parameters.maxLength;
    var factor = (progression / progressionsGeneralScope[activePhaseIndex][vertex.index]) *
        progressionsPhaseScope[activePhaseIndex][vertex.index];
    var result = factor * maxLength;
    return result;
};
var radiusSecondGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex, phasesDuration = _a.phasesDuration;
    var maxLength = endPath.parameters.maxLength;
    var factor = (progression / progressionsGeneralScope[activePhaseIndex][vertex.index]) *
        progressionsPhaseScope[activePhaseIndex][vertex.index];
    var result = factor * maxLength;
    return result / 2;
};
var phaseTwo = {
    duration: duration,
    progressionsPhaseScope: progressionsPhaseScope,
    progressionsGeneralScope: progressionsGeneralScope,
    groupsParameters: [
        {
            incircle: function () { return false; },
            type: function () { return "radial"; },
            radius: radiusFirstGroup,
            adaptArms: function () { return true; },
            round: function () { return 1; },
            lengthBasedRound: function () { return true; }
        },
        {
            incircle: function () { return false; },
            type: function () { return "linear"; },
            radius: radiusSecondGroup,
            adaptArms: function () { return false; },
            round: function () { return 1; },
            lengthBasedRound: function () { return true; }
        }
    ]
};
/////////////////
// Phase three //
/////////////////
var progressionsPhaseScope = function (params) {
    var progressions = [];
    var endPath = params.endPath, duration = params.duration;
    var vertexes = endPath.vertexes;
    var maxLength = endPath.parameters.maxLengthByGroup[1];
    for (var i = 0; i < vertexes.length; i++) {
        var vertex = vertexes[i];
        if (vertex.group === 0) {
            // Handle M and C type vertexes
            var prevIndex = i === 0 ? vertexes.length - 2 : i - 1;
            var nextIndex = i === vertexes.length - 1 ? 1 : i + 1;
            var prevDelta = maxLength / vertexes[prevIndex].length;
            var nextDelta = maxLength / vertexes[nextIndex].length;
            var prevProgression = 1 / prevDelta;
            var nextProgression = 1 / nextDelta;
            progressions[prevIndex] = prevProgression;
            progressions[nextIndex] = nextProgression;
            progressions[i] =
                nextProgression > prevProgression ? nextProgression : prevProgression;
        }
        else if (progressions[i] === undefined) {
            var delta = maxLength / vertex.length;
            progressions[i] = 1 / delta;
        }
    }
    return progressions;
};
var progressionsGeneralScope = function (params) {
    var duration = params.duration, endPath = params.endPath, prevPhaseProgressions = params.prevPhaseProgressions;
    var vertexes = endPath.vertexes;
    var maxLength = endPath.parameters.maxLengthByGroup[1];
    var progressions = [];
    for (var i = 0; i < vertexes.length; i++) {
        var vertex = vertexes[i];
        if (vertex.group === 0) {
            // Handle M and C type vertexes
            var prevIndex = i === 0 ? vertexes.length - 2 : i - 1;
            var nextIndex = i === vertexes.length - 1 ? 1 : i + 1;
            var prevDelta = maxLength / vertexes[prevIndex].length;
            var nextDelta = maxLength / vertexes[nextIndex].length;
            var prevProgression = duration / prevDelta + prevPhaseProgressions[prevIndex];
            var nextProgression = duration / nextDelta + prevPhaseProgressions[nextIndex];
            progressions[prevIndex] = prevProgression;
            progressions[nextIndex] = nextProgression;
            progressions[i] =
                nextProgression > prevProgression ? nextProgression : prevProgression;
        }
        else if (progressions[i] === undefined) {
            var delta = maxLength / vertex.length;
            progressions[i] = duration / delta + prevPhaseProgressions[i];
        }
    }
    return progressions;
};
var roundFirstGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex;
    var vertexes = endPath.vertexes;
    var prevIndex = vertex.index === 0 ? vertexes.length - 2 : vertex.index - 1;
    var nextIndex = vertex.index === vertexes.length - 1 ? 1 : vertex.index + 1;
    var firstFactor = progression / progressionsGeneralScope[activePhaseIndex][prevIndex];
    var firstArm = 1 - firstFactor;
    if (firstArm < 0)
        firstArm = 0;
    var secondFactor = progression / progressionsGeneralScope[activePhaseIndex][nextIndex];
    var secondArm = 1 - secondFactor;
    if (secondArm < 0)
        secondArm = 0;
    var result = [firstArm, secondArm];
    return result;
};
var radiusSecondGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex;
    var maxLength = endPath.parameters.maxLengthByGroup[1];
    var factor = (progression / progressionsGeneralScope[activePhaseIndex][vertex.index]) *
        progressionsPhaseScope[activePhaseIndex][vertex.index];
    var result = factor * maxLength;
    return result;
};
var phaseThree = {
    duration: function () { return 0.5; },
    progressionsPhaseScope: progressionsPhaseScope,
    progressionsGeneralScope: progressionsGeneralScope,
    groupsParameters: [
        {
            incircle: function () { return false; },
            type: function () { return "radial"; },
            radius: function (_a) {
                var vertex = _a.vertex;
                return vertex.length;
            },
            adaptArms: function () { return true; },
            round: roundFirstGroup,
            lengthBasedRound: function () { return true; }
        },
        {
            incircle: function () { return false; },
            type: function () { return "linear"; },
            radius: radiusSecondGroup,
            adaptArms: function () { return false; },
            round: function () { return 1; },
            lengthBasedRound: function () { return true; }
        }
    ]
};
exports.default = {
    loop: undefined,
    startGroupsParameters: startGroupsParameters,
    endGroupsParameters: endGroupsParameters,
    baseParameters: baseParameters,
    phases: [__assign({}, phaseOne), __assign({}, phaseTwo), __assign({}, phaseThree)]
};
