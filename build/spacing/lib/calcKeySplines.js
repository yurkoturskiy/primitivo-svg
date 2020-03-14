"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pointToNumber_1 = __importDefault(require("./pointToNumber"));
var calcTime_1 = __importDefault(require("./calcTime"));
var calcPx_1 = __importDefault(require("./calcPx"));
var ramda_1 = require("ramda");
var pipeable_1 = require("fp-ts/lib/pipeable");
var log = require("loglevel").getLogger("spacing-log");
var parseSplines = function (splines) {
    return splines.reduce(function (acc, spline) {
        return acc.concat([spline == null ? spline : pointToNumber_1.default(spline)]);
    }, []);
};
var initBzs = function (amount) {
    return pipeable_1.pipe(ramda_1.update(0, [0, 0], Array(amount)), ramda_1.update(-1, [1, 1]));
};
var calcKeySplines = function (parameters) {
    var keyTimes = parameters.keyTimes, keySplines = parameters.keySplines, progression = parameters.progression;
    var splines = parseSplines(keySplines);
    log.debug("converted splines", splines);
    var bzs = initBzs(keyTimes.length);
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
            // Calc points of a spline
            var p1_1 = bzs[(i + (i % 2)) / 2 - 1];
            var p2_1 = splines[i - 1];
            var p3_1 = splines[p3Index];
            p[1] = progression[(i + (i % 2)) / 2];
            t = calcTime_1.default(p1_1[1], p2_1[1], p3_1[1], p4[1], p[1]);
            p[0] = calcPx_1.default(p1_1[0], p2_1[0], p3_1[0], p4[0], t);
            p5 = [(1 - t) * p1_1[0] + t * p2_1[0], (1 - t) * p1_1[1] + t * p2_1[1]];
            p6 = [(1 - t) * p2_1[0] + t * p3_1[0], (1 - t) * p2_1[1] + t * p3_1[1]];
            p7 = [(1 - t) * p3_1[0] + t * p4[0], (1 - t) * p3_1[1] + t * p4[1]];
            p8 = [(1 - t) * p5[0] + t * p6[0], (1 - t) * p5[1] + t * p6[1]];
            p9 = [(1 - t) * p6[0] + t * p7[0], (1 - t) * p6[1] + t * p7[1]];
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
    return { parameters: parameters, keySplinesList: splines, keyTimesList: keyTimes, bzs: bzs };
};
exports.default = calcKeySplines;
