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
var getValueFromRange = function (values, numOfKeyPaths, index) {
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    return ((max - min) / numOfKeyPaths) * index + min;
};
function animateValue(numOfKeyPaths, keyPathsParameters) {
    var inputKeyPathsParameters = keyPathsParameters; // Maybe need to refactor
    var paths = [];
    for (var i = 0; i < numOfKeyPaths; i++) {
        var pathParameters = {};
        log.debug("key path number", i);
        for (var key in inputKeyPathsParameters) {
            // Set parameters for 'i' key path
            if (typeof inputKeyPathsParameters[key] !== "object")
                pathParameters[key] = inputKeyPathsParameters[key];
            else {
                if (inputKeyPathsParameters[key].length === numOfKeyPaths)
                    pathParameters[key] = inputKeyPathsParameters[key][i];
                else if (typeof inputKeyPathsParameters[key][i] === "number")
                    pathParameters[key] = getValueFromRange(inputKeyPathsParameters[key], numOfKeyPaths, i);
                else
                    throw "Wrong '" + key + "' parameter array at " + i + " key path";
            }
        }
        log.debug("generated parameters", pathParameters);
        paths[i] = index_1.default(pathParameters);
        log.debug("generated path", paths[i]);
    }
}
exports.default = animateValue;
