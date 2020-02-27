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
var pointToString_1 = __importDefault(require("./pointToString"));
var log = require("loglevel").getLogger("spacing-log");
var transform = function (spacing, spline, index, splines) {
    var progression = spacing.parameters.progression;
    var bzs = spacing.bzs, keyTimesList = spacing.keyTimesList;
};
var transformSplines = function (spacing) {
    var splines = spacing.keySplinesList.concat();
    var progression = spacing.parameters.progression;
    var bzs = spacing.bzs, keyTimesList = spacing.keyTimesList;
    for (var i = 0; i < progression.length - 1; i++) {
        splines[i] = [splines[i][0] - bzs[i][0], splines[i][1] - bzs[i][1]];
        splines[i + 1] = [
            splines[i + 1][0] - bzs[i][0],
            splines[i + 1][1] - bzs[i][1]
        ];
        var factor = [
            1 / (bzs[i + 1][0] - bzs[i][0]),
            1 / (bzs[i + 1][1] - bzs[i][1])
        ];
        log.debug("factor", factor);
        splines[i] = [splines[i][0] * factor[0], splines[i][1] * factor[1]];
        splines[i + 1] = [
            splines[i + 1][0] * factor[0],
            splines[i + 1][1] * factor[1]
        ];
        splines[i] = pointToString_1.default(splines[i]);
        splines[i + 1] = pointToString_1.default(splines[i + 1]);
        splines[i] = [splines[i], splines[i + 1]];
        splines.splice(i + 1, 1);
    }
    log.debug("splines", splines);
    return __assign({}, spacing, { 
        // keySplines: spacing.keySplinesList.reduce(transform, spacing).join("; "),
        keySplines: splines.join("; "), keyTimes: keyTimesList.join("; ") });
};
exports.default = transformSplines;
