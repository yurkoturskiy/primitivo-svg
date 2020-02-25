"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pipeable_1 = require("fp-ts/lib/pipeable");
// Defaults
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
// Methods
var setParameters_1 = __importDefault(require("./lib/setParameters"));
var generateOuterPaths_1 = __importDefault(require("./lib/generateOuterPaths"));
var calcProgressions_1 = __importDefault(require("./lib/calcProgressions"));
var generateGroupsParameters_1 = __importDefault(require("./lib/generateGroupsParameters"));
var generateDescription_1 = __importDefault(require("./lib/generateDescription"));
var phasesLayer = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default; }
    return pipeable_1.pipe(setParameters_1.default(parameters), generateOuterPaths_1.default, calcProgressions_1.default, generateGroupsParameters_1.default, generateDescription_1.default);
};
exports.default = phasesLayer;
