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
    pathsGroupsParameters.fill([], 0, progressions.length);
    for (var pIndex = 0; pIndex < progressions.length; pIndex++) {
        log.debug("progression", progressions[pIndex]);
        endPath.vertexes.forEach(function (keyVertex, vIndex) {
            for (var pIndex_1 = 0; pIndex_1 < phases.length; pIndex_1++) {
                var phaseIsActive = progressionsGeneralScope[pIndex_1][vIndex] >= progressions[pIndex_1];
                log.debug("vertex #" + vIndex + " Phase #" + pIndex_1 + " is " + phaseIsActive);
                if (!phaseIsActive)
                    continue;
                var groupsParameters = phases[pIndex_1].groupsParameters;
                for (var gIndex = 0; gIndex < groupsParameters.length; gIndex++)
                    for (var key in groupsParameters[gIndex]) {
                        if (key !== "groups") {
                            var method = phases[pIndex_1].groupsParameters[gIndex][key];
                            var value = method({ startPath: startPath, endPath: endPath, vIndex: vIndex });
                            log.debug("vertex #" + vIndex + "; " + key + ": " + value);
                        }
                    }
                if (phaseIsActive)
                    break;
            }
        });
    }
    log.info("end phases layer");
};
exports.default = phasesLayer;
