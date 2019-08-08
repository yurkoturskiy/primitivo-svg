"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Layers
var index_1 = __importDefault(require("../pathLayer/index"));
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
    var numOfKeyPaths = parameters.numOfKeyPaths, loop = parameters.loop;
    var inputKeyPathsParameters = keyPathsParameters; // Maybe need to refactor
    var paths = [];
    var ds = [];
    for (var i = 0; i < numOfKeyPaths; i++) {
        var pathParameters = {};
        for (var key in inputKeyPathsParameters) {
            // Set parameters for 'i' key path
            if (typeof inputKeyPathsParameters[key] !== "object")
                // if one value for all paths
                pathParameters[key] = inputKeyPathsParameters[key];
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
        ds[i] = path.d;
        if (loop && i !== numOfKeyPaths - 1)
            ds[(numOfKeyPaths - 1) * 2 - i] = path.d;
    }
    var values = ds.join(";");
    return values;
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
