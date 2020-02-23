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
var pipeable_1 = require("fp-ts/lib/pipeable");
var index_1 = __importDefault(require("../morphing/index"));
var log = require("loglevel").getLogger("phases-log");
// Defaults
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
// Methods
var setParameters_1 = __importDefault(require("./lib/setParameters"));
var generateOuterPaths_1 = __importDefault(require("./lib/generateOuterPaths"));
var calcProgressions_1 = __importDefault(require("./lib/calcProgressions"));
var generateGroupsParameters_1 = __importDefault(require("./lib/generateGroupsParameters"));
var generateDValues = function (data) {
    log.info("start generate d values");
    var _a = data.parameters, loop = _a.loop, baseParameters = _a.baseParameters, startGroupsParameters = _a.startGroupsParameters, endGroupsParameters = _a.endGroupsParameters;
    var pathsGroupsParameters = data.pathsGroupsParameters;
    var morphingParams = {
        numOfKeyPaths: pathsGroupsParameters.length + 1,
        loop: loop
    };
    log.debug("morphing params", morphingParams);
    // data.progressions.push(1);
    data.progressions.unshift(0);
    var pathsParams = __assign({}, baseParameters, { groups: [startGroupsParameters].concat(pathsGroupsParameters) });
    log.debug("paths parameters", pathsParams);
    data.dValues = index_1.default(morphingParams, pathsParams).dValues;
    return data;
};
var phasesLayer = function (parameters) {
    if (parameters === void 0) { parameters = defaultParameters_1.default; }
    return pipeable_1.pipe(setParameters_1.default(parameters), generateOuterPaths_1.default, calcProgressions_1.default, generateGroupsParameters_1.default, generateDValues);
};
exports.default = phasesLayer;
