"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var log = __importStar(require("loglevel"));
// Layers
var index_1 = __importDefault(require("../pathLayer/index"));
// misc functions
var solveCubicEquation_1 = __importDefault(require("./solveCubicEquation"));
var getType = function (item) {
    if (Array.isArray(item))
        return "array";
    if (typeof item === "object")
        return "object";
    if (typeof item === "number")
        return "number";
};
var getValueFromRange = function (values, numOfKeyPaths, index) {
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    return ((max - min) / numOfKeyPaths) * index + min;
};
function animateValue(parameters, keyPathsParameters) {
    /*
     * Generate paths and return string for values option of animate tag.
     * Example:
     *   <animate values={values} ... />
     *
     * Figure out first how pathLayer works.
     */
    if (parameters === void 0) { parameters = defaults.parameters; }
    if (keyPathsParameters === void 0) { keyPathsParameters = defaults.keyPathsParameters; }
    var generateDValues = function () {
        var numOfKeyPaths = parameters.numOfKeyPaths, loop = parameters.loop;
        var inputKeyPathsParameters = keyPathsParameters; // Maybe need to refactor
        var paths = [];
        var dValues = [];
        for (var i = 0; i < numOfKeyPaths; i++) {
            var pathParameters = {};
            for (var key in inputKeyPathsParameters) {
                // Set parameters for 'i' key path
                if (key === "groups") {
                    if (getType(inputKeyPathsParameters[key][0] === "object"))
                        // One setup for all key paths groups
                        pathParameters[key] = inputKeyPathsParameters[key];
                    else
                        pathParameters[key] = inputKeyPathsParameters[key];
                    console.log("group param", pathParameters[key]);
                }
                else if (typeof inputKeyPathsParameters[key] !== "object") {
                    // if one value for all paths
                    pathParameters[key] = inputKeyPathsParameters[key];
                }
                else {
                    if (inputKeyPathsParameters[key].length === numOfKeyPaths)
                        // if individual values for each path
                        pathParameters[key] = inputKeyPathsParameters[key][i];
                    else if (inputKeyPathsParameters[key].length === 2)
                        // calculate value from [min number, max number] range
                        pathParameters[key] = getValueFromRange(inputKeyPathsParameters[key], numOfKeyPaths, i);
                    else
                        throw "Wrong '" + key + "' parameter array at " + i + " key path";
                }
            }
            var path = index_1.default(pathParameters);
            paths[i] = path;
            dValues[i] = path.d;
            if (loop && i !== numOfKeyPaths - 1)
                dValues[(numOfKeyPaths - 1) * 2 - i] = path.d;
        }
        dValues = dValues.join(";");
        return dValues;
    };
    var pointToNumber = function (point) {
        console.log("point to number", point);
        var p = point.split(",");
        p = [Number(p[0]), Number(p[1])];
        log.debug("converted point to number", p);
        return p;
    };
    var pointToString = function (point) { return point.join(","); };
    function calcTime(p1y, p2y, p3y, p4y, py) {
        var a = p4y - 3 * p3y + 3 * p2y - p1y;
        console.log("a", a);
        var b = 3 * (p3y - 2 * p2y + p1y);
        console.log("b", b);
        var c = 3 * (p2y - p1y);
        console.log("c", c);
        var d = p1y - py;
        console.log("d", d);
        var ts = solveCubicEquation_1.default(a, b, c, d);
        for (var _i = 0, ts_1 = ts; _i < ts_1.length; _i++) {
            var t = ts_1[_i];
            if (t > 0 && t < 1)
                return t;
        }
        return ts[1];
    }
    function calcPx(p1x, p2x, p3x, p4x, t) {
        var p = p1x * Math.pow(1 - t, 3) +
            3 * p2x * t * Math.pow(1 - t, 2) +
            3 * p3x * Math.pow(t, 2) * (1 - t) +
            p4x * Math.pow(t, 3);
        return p;
    }
    var setSpacing = function () {
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
            console.log("p", i);
            if (splines[i] == null) {
                console.log(splines[i]);
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
                t = calcTime(p1_1[1], p2_1[1], p3_1[1], p4[1], p[1]);
                log.debug("t", t);
                p[0] = calcPx(p1_1[0], p2_1[0], p3_1[0], p4[0], t);
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
        console.log("splines", splines);
        return { keySplines: splines.join("; "), keyTimes: keyTimes.join("; ") };
    };
    var output = {};
    if ((parameters.keySplines, parameters.keyTimes, parameters.progression))
        output = setSpacing();
    output.dValues = generateDValues();
    return output;
}
exports.default = animateValue;
var defaults = {
    parameters: {
        loop: true,
        numOfKeyPaths: 3
    },
    keyPathsParameters: {
        numOfSegments: 3,
        depth: 0,
        x: 0,
        y: 0,
        width: 200,
        height: 200,
        centerX: 100,
        centerY: 100,
        rotate: 0,
        numOfGroups: 2,
        incircle: true,
        groups: [
            [
                {
                    type: "radial",
                    distance: 1,
                    round: 1
                },
                {
                    type: "radial",
                    distance: 1,
                    round: 1
                }
            ],
            [
                {
                    type: "radial",
                    distance: 1,
                    round: 0.4
                },
                {
                    type: "linear",
                    distance: 0.6,
                    round: 3
                }
            ],
            [
                {
                    type: "radial",
                    distance: 1,
                    round: 0.1
                },
                {
                    type: "linear",
                    distance: 1,
                    round: 3
                }
            ]
        ]
    }
};
