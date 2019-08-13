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
        return p;
    };
    var pointToString = function (point) { return point.join(","); };
    var calcInterpolation = function (parameters) {
        var t = parameters.t, p1 = parameters.p1, p2 = parameters.p2, p3 = parameters.p3, p4 = parameters.p4;
        log.debug("interpolation input parameters", parameters);
        var p5 = [
            (1 - t) * p1[0] + t * p2[0],
            (1 - t) * p1[1] + t * p2[1]
        ];
        var p6 = [
            (1 - t) * p2[0] + t * p3[0],
            (1 - t) * p2[1] + t * p3[1]
        ];
        var p7 = [
            (1 - t) * p3[0] + t * p4[0],
            (1 - t) * p3[1] + t * p4[1]
        ];
        var p8 = [
            (1 - t) * p5[0] + t * p6[0],
            (1 - t) * p5[1] + t * p6[1]
        ];
        var p9 = [
            (1 - t) * p6[0] + t * p7[0],
            (1 - t) * p6[1] + t * p7[1]
        ];
        var bz = [
            (1 - t) * p8[0] + t * p9[0],
            (1 - t) * p8[1] + t * p9[1]
        ];
        return { p5: p5, p6: p6, p7: p7, p8: p8, p9: p9, bz: bz };
    };
    var setSpacing = function () {
        var keyTimes = parameters.keyTimes, keySplines = parameters.keySplines;
        var splines = keySplines.concat();
        for (var i = 0; i < splines.length; i++) {
            if (splines[i] !== "pass")
                splines[i] = pointToNumber(splines[i]);
        }
        var bzs = [];
        bzs[0] = [0, 0];
        bzs[keyTimes.length - 1] = [1, 1];
        var p4 = [1, 1];
        var p3Index;
        var t;
        for (var i = 1; i < splines.length; i += 2) {
            console.log("p", i);
            if (splines[i] === "pass") {
                console.log(splines[i]);
                if (!p3Index || i > p3Index) {
                    for (var end = i; i < splines.length; end++) {
                        // Find next key spline
                        if (splines[end] !== "pass") {
                            p3Index = end;
                            break;
                        }
                    }
                }
                t = keyTimes[(i + (i % 2)) / 2];
                var interpolation = calcInterpolation({
                    t: t,
                    p1: bzs[(i + (i % 2)) / 2 - 1],
                    p2: splines[i - 1],
                    p3: splines[p3Index],
                    p4: p4
                });
                console.log("interpolation", interpolation);
                var p5 = interpolation.p5, p6 = interpolation.p6, p7 = interpolation.p7, p8 = interpolation.p8, p9 = interpolation.p9, bz = interpolation.bz;
                splines[i - 1] = p5;
                splines[i] = p8;
                splines[i + 1] = p9;
                splines[p3Index] = p7;
                bzs[(i + (i % 2)) / 2] = bz;
            }
        }
        log.debug("bzs", bzs);
        for (var i = 0; i < bzs.length - 1; i++) { }
        for (var i = 0; i < keyTimes.length - 1; i++) {
            var factor = [
                (1 + bzs[i][0]) / bzs[i + 1][0],
                (1 + bzs[i][1]) / bzs[i + 1][1]
            ];
            log.debug("factor", factor);
            splines[i] = [
                splines[i][0] * factor[0] - bzs[i][0],
                splines[i][1] * factor[1] - bzs[i][1]
            ];
            splines[i + 1] = [
                splines[i + 1][0] * factor[0] - bzs[i][0],
                splines[i + 1][1] * factor[1] - bzs[i][1]
            ];
            splines[i] = pointToString(splines[i]);
            splines[i + 1] = pointToString(splines[i + 1]);
            splines[i] = [splines[i], splines[i + 1]];
            splines.splice(i + 1, 1);
        }
        console.log("splines", splines);
        return splines.join(";");
    };
    var output = {};
    output.dValues = generateDValues();
    if ((parameters.keySplines, parameters.keyTimes))
        output.keySplines = setSpacing();
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
