"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// misc functions
var calcTime_1 = __importDefault(require("./lib/calcTime"));
var calcPx_1 = __importDefault(require("./lib/calcPx"));
var prepareParameters_1 = __importDefault(require("./lib/prepareParameters"));
var log = require("loglevel").getLogger("spacing-log");
var pointToNumber = function (point) {
    log.debug("point to number", point);
    var p = point.split(",");
    p = [Number(p[0]), Number(p[1])];
    log.debug("converted point to number", p);
    return p;
};
var pointToString = function (point) { return point.join(","); };
var spacingLayer = function (parameters) {
    parameters = prepareParameters_1.default(parameters);
    var keyTimes = parameters.keyTimes, keySplines = parameters.keySplines, progression = parameters.progression;
    var splines = keySplines.concat();
    for (var i = 0; i < splines.length; i++) {
        if (splines[i] != null)
            splines[i] = pointToNumber(splines[i]);
    }
    log.debug("converted splines", splines);
    var bzs = [];
    bzs[0] = [0, 0];
    bzs[keyTimes.length - 1] = [1, 1];
    var t;
    var p, p1, p2, p3, p4, p5, p6, p7, p8, p9;
    p = []; // proto bz
    p4 = [1, 1];
    var p3Index;
    // Calc keySplines
    for (var i = 1; i < splines.length; i += 2) {
        log.debug("p", i);
        if (splines[i] == null) {
            log.debug(splines[i]);
            if (!p3Index || i > p3Index) {
                for (var end = i; i < splines.length; end++) {
                    // Find next key spline
                    if (splines[end] != null) {
                        p3Index = end;
                        break;
                    }
                }
            }
            var p1_1 = bzs[(i + (i % 2)) / 2 - 1];
            log.debug("p1", p1_1);
            var p2_1 = splines[i - 1];
            log.debug("p2", p2_1);
            var p3_1 = splines[p3Index];
            log.debug("p3", p3_1);
            log.debug("p4", p4);
            p[1] = progression[(i + (i % 2)) / 2];
            t = calcTime_1.default(p1_1[1], p2_1[1], p3_1[1], p4[1], p[1]);
            log.debug("t", t);
            p[0] = calcPx_1.default(p1_1[0], p2_1[0], p3_1[0], p4[0], t);
            log.debug("p", p);
            p5 = [(1 - t) * p1_1[0] + t * p2_1[0], (1 - t) * p1_1[1] + t * p2_1[1]];
            log.debug("p5", p5);
            p6 = [(1 - t) * p2_1[0] + t * p3_1[0], (1 - t) * p2_1[1] + t * p3_1[1]];
            log.debug("p6", p6);
            p7 = [(1 - t) * p3_1[0] + t * p4[0], (1 - t) * p3_1[1] + t * p4[1]];
            log.debug("p7", p7);
            p8 = [(1 - t) * p5[0] + t * p6[0], (1 - t) * p5[1] + t * p6[1]];
            log.debug("p8", p8);
            p9 = [(1 - t) * p6[0] + t * p7[0], (1 - t) * p6[1] + t * p7[1]];
            log.debug("p9", p9);
            splines[i - 1] = p5.concat();
            splines[i] = p8.concat();
            splines[i + 1] = p9.concat();
            splines[p3Index] = p7.concat();
            bzs[(i + (i % 2)) / 2] = p.concat();
            keyTimes[(i + (i % 2)) / 2] = p[0];
        }
    }
    log.debug("key times", keyTimes);
    log.debug("bzs", bzs);
    log.debug("splines before transformation", splines.concat());
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
        splines[i] = pointToString(splines[i]);
        splines[i + 1] = pointToString(splines[i + 1]);
        splines[i] = [splines[i], splines[i + 1]];
        splines.splice(i + 1, 1);
    }
    log.debug("splines", splines);
    return { keySplines: splines.join("; "), keyTimes: keyTimes.join("; ") };
};
exports.default = spacingLayer;
