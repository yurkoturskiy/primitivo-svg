"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
var setDefaults_1 = __importDefault(require("./lib/setDefaults"));
var generateDValues_1 = __importDefault(require("./lib/generateDValues"));
/**
 * Generate paths and return string for values option of animate tag.
 * Example:
 *   <animate values={values} ... />
 *
 * Figure out first how pathLayer works.
 */
var morphingLayer = function (parameters, keyPathsParameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default.parameters; }
    if (keyPathsParameters === void 0) { keyPathsParameters = defaultParameters_1.default.keyPathsParameters; }
    return pipeable_1.pipe(setDefaults_1.default(parameters, keyPathsParameters), generateDValues_1.default);
};
exports.default = morphingLayer;
