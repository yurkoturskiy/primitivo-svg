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
var log = require("loglevel").getLogger("phases-log");
// Defaults
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
var phasesLayer = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default; }
    log.info("run phases layer");
    ////////////////////////////////
    // Create start and end paths //
    var baseParameters = parameters.baseParameters, startGroupsParameters = parameters.startGroupsParameters, endGroupsParameters = parameters.endGroupsParameters;
    var startPath = index_1.default(__assign({}, baseParameters, { groups: startGroupsParameters }));
    var endPath = index_1.default(__assign({}, baseParameters, { groups: endGroupsParameters }));
    log.debug("start path", startPath);
    log.debug("end path", endPath);
    var phases = parameters.phases;
    var numOfPhases = parameters.phases.length;
    log.debug("numOfPhases: " + numOfPhases);
    ///////////////////////
    // Calc Progressions //
    var progressionsPhaseScope = Array(numOfPhases);
    progressionsPhaseScope.fill([], 0, numOfPhases);
    var progressionsGeneralScope = Array(numOfPhases);
    progressionsGeneralScope.fill([], 0, numOfPhases);
    var progressions;
    for (var i_1 = 0; i_1 < parameters.phases.length; i_1++) {
        // Calc progressionsPhaseScope
        progressionsPhaseScope[i_1] = parameters.phases[i_1].progressionsPhaseScope({
            startPath: startPath,
            endPath: endPath
        });
        // Calc progressionsGeneralScope
        var duration = parameters.phases[i_1].duration;
        var prevPhaseProgressions = i_1 && progressionsGeneralScope[i_1 - 1];
        progressionsGeneralScope[i_1] = parameters.phases[i_1].progressionsGeneralScope({ startPath: startPath, endPath: endPath, duration: duration, prevPhaseProgressions: prevPhaseProgressions });
    }
    log.debug("progressions phase scope", progressionsPhaseScope);
    log.debug("progressions general scope", progressionsGeneralScope);
    // Calc progressions
    progressions = progressionsGeneralScope.flat();
    // Sort
    progressions = progressions.sort(function (a, b) { return a - b; });
    // Remove dublicates
    var i = 0;
    while (i < progressions.length) {
        if (progressions[i - 1] === progressions[i])
            progressions.splice(i, 1);
        else
            i += 1;
    }
    log.debug("progressions", progressions);
    ////////////////////////////////////////////////////////////////
    // Set groups parameters for each progression and each vertex //
    var pathsGroupsParameters = Array(progressions.length);
    var _loop_1 = function (prIndex) {
        pathsGroupsParameters[prIndex] = [];
        endPath.vertexes.forEach(function (vertex, vIndex) {
            var gIndex = vertex.group;
            var indexWithingGroup = vertex.indexWithingGroup;
            // loop vertexes
            var activePhaseIndex;
            for (var phIndex = 0; phIndex < phases.length; phIndex++) {
                // loop phases and pick first incoplete phase to take values from
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
                        progressionsGeneralScope: progressionsGeneralScope[activePhaseIndex],
                        progressionsPhaseScope: progressionsPhaseScope[activePhaseIndex],
                        progression: progressions[prIndex]
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
    log.info("end phases layer");
};
exports.default = phasesLayer;
