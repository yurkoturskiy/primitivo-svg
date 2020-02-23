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
var pipeable_1 = require("fp-ts/lib/pipeable");
var index_1 = __importDefault(require("../morphing/index"));
var log = require("loglevel").getLogger("phases-log");
// Defaults
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
// Methods
var setParameters_1 = __importDefault(require("./lib/setParameters"));
var generateOuterPaths_1 = __importDefault(require("./lib/generateOuterPaths"));
var generateGroupsParameters = function (data) {
    // Set groups parameters for each progression and each vertex
    var endPath = data.endPath, startPath = data.startPath, progressions = data.progressions, progressionsGeneralScope = data.progressionsGeneralScope, progressionsPhaseScope = data.progressionsPhaseScope;
    var phases = data.parameters.phases;
    var numOfPhases = phases.length;
    var pathsGroupsParameters = Array(progressions.length);
    var _loop_1 = function (prIndex) {
        pathsGroupsParameters[prIndex] = [];
        endPath.vertexes.forEach(function (vertex, vIndex) {
            var gIndex = vertex.group;
            var indexWithingGroup = vertex.indexWithingGroup;
            // loop vertexes
            var activePhaseIndex;
            var keyVertexIndex;
            for (var phIndex = 0; phIndex < numOfPhases; phIndex++) {
                // loop phases and pick first incomplete phase to take values from
                // Check if current phase is incomplete
                var phaseIsIncomplete = progressions[prIndex] <= progressionsGeneralScope[phIndex][vIndex];
                if (phaseIsIncomplete) {
                    // Current phase is the one we need. Break phases loop.
                    var groupsParameters = phases[phIndex].groupsParameters;
                    activePhaseIndex = phIndex;
                    break;
                }
            }
            if (pathsGroupsParameters[prIndex][gIndex] === undefined)
                pathsGroupsParameters[prIndex][gIndex] = {};
            var parametersSource = 
            // If activePhaseIndex is undefined set previous progression values as a source
            activePhaseIndex === undefined
                ? pathsGroupsParameters[prIndex - 1][gIndex]
                : phases[activePhaseIndex].groupsParameters[gIndex];
            for (var _i = 0, _a = Object.entries(parametersSource); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], source = _b[1];
                // loop group param methods and take values
                var value = 
                // If activePhaseIndex is undefined take value from previus progression
                activePhaseIndex === undefined
                    ? source[indexWithingGroup]
                    : source({
                        startPath: startPath,
                        endPath: endPath,
                        vertex: vertex,
                        progression: progressions[prIndex],
                        activePhaseIndex: activePhaseIndex,
                        progressionsGeneralScope: progressionsGeneralScope,
                        progressionsPhaseScope: progressionsPhaseScope
                    });
                if (pathsGroupsParameters[prIndex][gIndex][key] === undefined)
                    pathsGroupsParameters[prIndex][gIndex][key] = [];
                pathsGroupsParameters[prIndex][gIndex][key][indexWithingGroup] = value;
            }
        });
    };
    for (var prIndex = 0; prIndex < progressions.length; prIndex++) {
        _loop_1(prIndex);
    }
    log.debug("paths groups parameters", pathsGroupsParameters);
    return __assign({}, data, { pathsGroupsParameters: pathsGroupsParameters });
};
var calcProgressions_1 = __importDefault(require("./lib/calcProgressions"));
var generateDValues = function (data) {
    log.info("start generate d values");
    var _a = data.parameters, loop = _a.loop, baseParameters = _a.baseParameters, startGroupsParameters = _a.startGroupsParameters, endGroupsParameters = _a.endGroupsParameters;
    var pathsGroupsParameters = data.pathsGroupsParameters;
    var morphingParams = {
        numOfKeyPaths: pathsGroupsParameters.length + 1,
        loop: loop
    };
    log.debug("morphing params", morphingParams);
    // data.progressions.push(1);
    data.progressions.unshift(0);
    var pathsParams = __assign({}, baseParameters, { groups: [startGroupsParameters].concat(pathsGroupsParameters) });
    log.debug("paths parameters", pathsParams);
    data.dValues = index_1.default(morphingParams, pathsParams).dValues;
    return data;
};
var phasesLayer = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default; }
    return pipeable_1.pipe(setParameters_1.default(parameters), generateOuterPaths_1.default, calcProgressions_1.default, generateGroupsParameters_1.default, generateDValues);
};
exports.default = phasesLayer;
