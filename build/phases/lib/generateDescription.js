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
var index_1 = __importDefault(require("../../morphing/index"));
// Logging
var log = require("loglevel").getLogger("phases-log");
var generateDescription = function (data) {
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
exports.default = generateDescription;
