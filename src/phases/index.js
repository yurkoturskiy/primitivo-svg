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
var index_1 = __importDefault(require("../path/index"));
var index_2 = __importDefault(require("../morphing/index"));
var log = require("loglevel").getLogger("phases-log");
// Defaults
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
var generateOuterPaths = function (data) {
    ////////////////////////////////
    // Create start and end paths //
    var _a = data.parameters, baseParameters = _a.baseParameters, startGroupsParameters = _a.startGroupsParameters, endGroupsParameters = _a.endGroupsParameters;
    data.startPath = index_1.default(__assign({}, baseParameters, { groups: startGroupsParameters }));
    data.endPath = index_1.default(__assign({}, baseParameters, { groups: endGroupsParameters }));
    log.debug("start path", data.startPath);
    log.debug("end path", data.endPath);
    return data;
};
var calcProgressions = function (data) {
    var parameters = data.parameters, startPath = data.startPath, endPath = data.endPath;
    var numOfPhases = parameters.phases.length;
    var progressionsPhaseScope = Array(numOfPhases);
    var progressionsGeneralScope = Array(numOfPhases);
    var progressions = [];
    for (var i_1 = 0; i_1 < numOfPhases; i_1++) {
        // Calc progressionsPhaseScope
        progressionsPhaseScope[i_1] = parameters.phases[i_1].progressionsPhaseScope({
            startPath: startPath,
            endPath: endPath
        });
        // Calc progressionsGeneralScope
        var duration = parameters.phases[i_1].duration;
        var prevPhaseProgressions = i_1 && progressionsGeneralScope[i_1 - 1];
        progressionsGeneralScope[i_1] = parameters.phases[i_1].progressionsGeneralScope({ startPath: startPath, endPath: endPath, duration: duration, prevPhaseProgressions: prevPhaseProgressions });
        // Form progressions objects
        for (var keyVertexIndex = 0; keyVertexIndex < progressionsGeneralScope[i_1].length; keyVertexIndex++)
            progressions.push({
                keyVertexIndex: keyVertexIndex,
                phaseIndex: i_1,
                generalScope: progressionsGeneralScope[i_1][keyVertexIndex],
                phaseScope: progressionsPhaseScope[i_1][keyVertexIndex]
            });
    }
    log.debug("progressions phase scope", progressionsPhaseScope);
    log.debug("progressions general scope", progressionsGeneralScope);
    // Sort progressions objects
    progressions = progressions.sort(function (a, b) { return a.generalScope - b.generalScope; });
    // Remove dublicates
    var i = 1;
    while (i < progressions.length) {
        if (progressions[i - 1].generalScope === progressions[i].generalScope)
            progressions.splice(i, 1);
        else
            i += 1;
    }
    log.debug("progressions", progressions);
    return __assign({}, data, { progressions: progressions,
        progressionsGeneralScope: progressionsGeneralScope,
        progressionsPhaseScope: progressionsPhaseScope });
};
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
            var phasesDuration = [];
            for (var phIndex = 0; phIndex < numOfPhases; phIndex++) {
                // loop phases and pick first incomplete phase to take values from
                phasesDuration.push(phases[phIndex].duration);
                // Check if current phase is incomplete
                var phaseIsIncomplete = progressions[prIndex].generalScope <=
                    progressionsGeneralScope[phIndex][vIndex];
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
                        phasesDuration: phasesDuration,
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
var generateDValues = function (data) {
    log.info("start generate d values");
    var _a = data.parameters, loop = _a.loop, baseParameters = _a.baseParameters, startGroupsParameters = _a.startGroupsParameters;
    var pathsGroupsParameters = data.pathsGroupsParameters;
    var morphingParams = {
        numOfKeyPaths: pathsGroupsParameters.length,
        loop: loop
    };
    var pathsParams = __assign({}, baseParameters, { groups: [startGroupsParameters].concat(pathsGroupsParameters) });
    log.debug("paths parameters", pathsParams);
    data.dValues = index_2.default(morphingParams, pathsParams).dValues;
    return data;
};
var phasesLayer = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default; }
    log.info("run phases layer");
    var data = { parameters: parameters };
    data = generateOuterPaths(data);
    data = calcProgressions(data);
    data = generateGroupsParameters(data);
    data = generateDValues(data);
    log.info("end phases layer");
    return data;
};
exports.default = phasesLayer;
