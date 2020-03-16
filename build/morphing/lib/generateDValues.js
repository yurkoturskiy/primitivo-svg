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
// misc
var index_1 = require("../../misc/index");
// Layers
var index_2 = __importDefault(require("../../path/index"));
// Logging
var log = require("loglevel").getLogger("phases-log");
var getValueFromRange = function (values, numOfKeyPaths, index) {
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    return ((max - min) / numOfKeyPaths) * index + min;
};
var generateDValues = function (data) {
    log.info("start generate d values");
    var _a = data.parameters, numOfKeyPaths = _a.numOfKeyPaths, loop = _a.loop;
    var inputKeyPathsParameters = data.keyPathsParameters; // Maybe need to refactor
    var paths = [];
    var dValuesFrames = [];
    for (var i = 0; i < numOfKeyPaths; i++) {
        log.info("generate key path number " + i);
        var pathParameters = {};
        for (var key in inputKeyPathsParameters) {
            // Set parameters for 'i' key path
            if (key === "groups") {
                if (index_1.getType(inputKeyPathsParameters[key][0]) === "object")
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
        var path = index_2.default(pathParameters);
        paths[i] = path;
        dValuesFrames[i] = path.d;
        if (loop) {
            if (loop === "linear" && i !== numOfKeyPaths - 1) {
                // Linear or boomerang loop
                dValuesFrames[(numOfKeyPaths - 1) * 2 - i] = path.d;
            }
            else if (loop === "circle" && i === numOfKeyPaths - 1) {
                // Circle loop. Last path equal to first
                dValuesFrames[numOfKeyPaths] = dValuesFrames[0];
            }
        }
    }
    var dValues = dValuesFrames.join(";");
    return __assign({}, data, { dValues: dValues, dValuesFrames: dValuesFrames });
};
exports.default = generateDValues;
