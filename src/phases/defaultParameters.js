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
var baseParameters = {
    numOfSegments: 4,
    x: 0,
    y: 0,
    width: 1000,
    height: 700,
    centerX: 200,
    centerY: 100,
    rotate: 45
};
var startGroupsParameters = [
    {
        incircle: true,
        radius: 8,
        round: 1,
        adaptArms: true,
        smartRound: true
    },
    {
        incircle: true,
        type: "radial",
        radius: 8,
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
        adaptArms: true
    },
    {
        incircle: false,
        type: "linear",
        distance: 1,
        round: 1,
        adaptArms: false
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
var phaseOne = {
    duration: 0.1,
    progressionsPhaseScope: progressionsPhaseScope,
    progressionsGeneralScope: progressionsGeneralScope,
    groupsParameters: [
        {
            incircle: function () { return true; },
            type: function () { return "radial"; },
            radius: function () { return 30; },
            round: function () { return 1; },
            adaptArms: function () { return true; },
            smartRound: function () { return true; }
        },
        {
            incircle: function () { return true; },
            type: function () { return "linear"; },
            radius: function () { return 30; },
            round: function () { return 1; },
            adaptArms: function () { return true; },
            smartRound: function () { return true; }
        }
    ]
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
    var factor = (progression.generalScope /
        progressionsGeneralScope[activePhaseIndex][vertex.index]) *
        progressionsPhaseScope[activePhaseIndex][vertex.index];
    var result = factor * maxLength;
    return result;
};
var radiusSecondGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex, phasesDuration = _a.phasesDuration;
    var maxLength = endPath.parameters.maxLength;
    var factor = (progression.generalScope /
        progressionsGeneralScope[activePhaseIndex][vertex.index]) *
        progressionsPhaseScope[activePhaseIndex][vertex.index];
    var result = factor * maxLength;
    return result / 2;
};
var phaseTwo = {
    duration: 0.5,
    progressionsPhaseScope: progressionsPhaseScope,
    progressionsGeneralScope: progressionsGeneralScope,
    groupsParameters: [
        {
            incircle: function () { return false; },
            type: function () { return "radial"; },
            radius: radiusFirstGroup,
            round: function () { return 1; }
        },
        {
            incircle: function () { return false; },
            type: function () { return "linear"; },
            radius: radiusSecondGroup,
            round: function () { return 1; }
        }
    ]
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
var roundFirstGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex;
    var factor = progression.generalScope /
        progressionsGeneralScope[activePhaseIndex][vertex.index];
    var result = 1 - factor;
    log.debug("progression", progression.generalScope);
    log.debug("vertex", vertex.index, "group", vertex.group, "factor", factor, "round", result, "active phase", activePhaseIndex);
    return result;
};
var radiusSecondGroup = function (_a) {
    var progression = _a.progression, endPath = _a.endPath, vertex = _a.vertex, progressionsGeneralScope = _a.progressionsGeneralScope, progressionsPhaseScope = _a.progressionsPhaseScope, activePhaseIndex = _a.activePhaseIndex;
    var maxLength = endPath.parameters.maxLength;
    var factor = (progression.generalScope /
        progressionsGeneralScope[activePhaseIndex][vertex.index]) *
        progressionsPhaseScope[activePhaseIndex][vertex.index];
    var result = factor * maxLength;
    return result;
};
var phaseThree = {
    duration: 0.4,
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
            round: roundFirstGroup
        },
        {
            incircle: function () { return false; },
            type: function () { return "linear"; },
            radius: radiusSecondGroup,
            round: function () { return 1; }
        }
    ]
};
exports.default = {
    loop: true,
    startGroupsParameters: startGroupsParameters,
    endGroupsParameters: endGroupsParameters,
    baseParameters: baseParameters,
    phases: [__assign({}, phaseOne), __assign({}, phaseTwo), __assign({}, phaseThree)]
};
