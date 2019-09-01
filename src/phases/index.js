"use strict";
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
    var startPath = index_1.default(parameters.startPath);
    var endPath = index_1.default(parameters.endPath);
    var phases = parameters.phases;
    log.debug("start path", startPath);
    log.debug("end path", endPath);
    var numOfPhases = parameters.phases.length;
    log.debug("numOfPhases: " + numOfPhases);
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
    var _loop_1 = function (progression) {
        log.debug("progression", progression);
        endPath.vertexes.forEach(function (keyVertex, vertexIndex) {
            for (var phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
                var phaseIsActive = progressionsGeneralScope[phaseIndex][vertexIndex] >= progression;
                log.debug("vertex #" + vertexIndex + " Phase #" + phaseIndex + " is " + phaseIsActive);
                if (!phaseIsActive)
                    continue;
                for (var key in phases[phaseIndex].parameters) {
                    if (key !== "groups") {
                        var method = phases[phaseIndex].parameters[key];
                        var value = method({ startPath: startPath, endPath: endPath, vertexIndex: vertexIndex });
                        log.debug("vertex #" + vertexIndex + "; " + key + ": " + value);
                    }
                }
                if (phaseIsActive)
                    break;
            }
        });
    };
    for (var _i = 0, progressions_1 = progressions; _i < progressions_1.length; _i++) {
        var progression = progressions_1[_i];
        _loop_1(progression);
    }
    log.info("end phases layer");
};
exports.default = phasesLayer;
