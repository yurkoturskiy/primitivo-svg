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
var path_1 = __importDefault(require("../../path"));
var log = require("loglevel").getLogger("phases-log");
var generateOuterPaths = function (data) {
    ////////////////////////////////
    // Create start and end paths //
    var _a = data.parameters, baseParameters = _a.baseParameters, startGroupsParameters = _a.startGroupsParameters, endGroupsParameters = _a.endGroupsParameters;
    data.startPath = path_1.default(__assign({}, baseParameters, { groups: startGroupsParameters }));
    data.endPath = path_1.default(__assign({}, baseParameters, { groups: endGroupsParameters }));
    log.debug("start path", data.startPath);
    log.debug("end path", data.endPath);
    return data;
};
exports.default = generateOuterPaths;
