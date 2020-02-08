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
var defaultParameters_1 = __importDefault(require("./defaultParameters"));
var ramda_1 = require("ramda");
var setDefaultParams = function (parameters) { return (__assign({}, defaultParameters_1.default, parameters, { numOfGroups: parameters.groups.length, groups: parameters.groups.map(function (group) { return (__assign({}, defaultParameters_1.default.groups[0], group)); }) })); };
var createPath = function (parameters) { return ({
    parameters: parameters
}); };
var initState = ramda_1.pipe(setDefaultParams, createPath);
exports.default = initState;
