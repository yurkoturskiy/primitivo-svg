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
var index_1 = __importDefault(require("../path/index"));
// mist
var index_2 = require("../misc/index");
var getValueFromRange = function (values, numOfKeyPaths, index) {
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    return ((max - min) / numOfKeyPaths) * index + min;
};
function morphingLayer(parameters, keyPathsParameters) {
    /*
     * Generate paths and return string for values option of animate tag.
     * Example:
     *   <animate values={values} ... />
     *
     * Figure out first how pathLayer works.
     */
    if (parameters === void 0) { parameters = defaults.parameters; }
    if (keyPathsParameters === void 0) { keyPathsParameters = defaults.keyPathsParameters; }
    var setDefaults = function () {
        parameters = __assign({}, defaults.parameters, parameters);
        keyPathsParameters = __assign({}, defaults.keyPathsParameters, keyPathsParameters);
    };
    var generateDValues = function () {
        log.info("start generate d values");
        log.debug("parameters", parameters);
        log.debug("key path parameters", keyPathsParameters);
        var numOfKeyPaths = parameters.numOfKeyPaths, loop = parameters.loop;
        var inputKeyPathsParameters = keyPathsParameters; // Maybe need to refactor
        var paths = [];
        var dValues = [];
        for (var i = 0; i < numOfKeyPaths; i++) {
            log.info("generate key path number " + i);
            var pathParameters = {};
            for (var key in inputKeyPathsParameters) {
                // Set parameters for 'i' key path
                if (key === "groups") {
                    if (index_2.getType(inputKeyPathsParameters[key][0]) === "object")
                        // One setup for all key paths groups
                        pathParameters[key] = inputKeyPathsParameters[key];
                    else
                        pathParameters[key] = inputKeyPathsParameters[key][i];
                    log.debug("group param", pathParameters[key]);
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
    setDefaults();
    var output = {};
    output.dValues = generateDValues();
    return output;
}
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
            {
                type: "radial",
                distance: [0.95, 1],
                round: 1
            },
            {
                type: "radial",
                distance: [1.3, 1.4],
                round: [0, 0.3]
            }
        ]
    }
};
exports.default = morphingLayer;
