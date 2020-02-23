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
var calcProgressions = function (data) {
    var parameters = data.parameters, startPath = data.startPath, endPath = data.endPath;
    var numOfPhases = parameters.phases.length;
    var progressionsPhaseScope = Array(numOfPhases);
    var progressionsGeneralScope = Array(numOfPhases);
    var progressions = [];
    var durations = [];
    for (var i_1 = 0; i_1 < numOfPhases; i_1++) {
        var duration = parameters.phases[i_1].duration({
            startPath: startPath,
            endPath: endPath,
            prevDurations: durations
        });
        durations.push(duration);
        // Calc progressionsPhaseScope
        progressionsPhaseScope[i_1] = parameters.phases[i_1].progressionsPhaseScope({
            startPath: startPath,
            endPath: endPath,
            duration: duration
        });
        // Calc progressionsGeneralScope
        var prevPhaseProgressions = i_1 && progressionsGeneralScope[i_1 - 1];
        progressionsGeneralScope[i_1] = parameters.phases[i_1].progressionsGeneralScope({
            startPath: startPath,
            endPath: endPath,
            duration: duration,
            prevPhaseProgressions: prevPhaseProgressions
        });
        // Form progressions objects
        for (var keyVertexIndex = 0; keyVertexIndex < progressionsGeneralScope[i_1].length; keyVertexIndex++)
            progressions.push(progressionsGeneralScope[i_1][keyVertexIndex]);
    }
    log.debug("progressions phase scope", progressionsPhaseScope);
    log.debug("progressions general scope", progressionsGeneralScope);
    // Sort progressions objects
    progressions = progressions.sort(function (a, b) { return a - b; });
    // Remove dublicates
    var i = 1;
    while (i < progressions.length) {
        if (progressions[i - 1] === progressions[i])
            progressions.splice(i, 1);
        else
            i += 1;
    }
    log.debug("progressions", progressions);
    return __assign({}, data, { progressions: progressions,
        progressionsGeneralScope: progressionsGeneralScope,
        progressionsPhaseScope: progressionsPhaseScope });
};
exports.default = calcProgressions;
