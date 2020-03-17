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
var defaultParameters_1 = __importDefault(require("./lib/defaultParameters"));
var setDefaultParams = function (parameters) { return (__assign({}, defaultParameters_1.default, parameters, { numOfGroups: parameters.numOfGroups || parameters.groups.length, groups: parameters.groups.map(function (group, index) { return (__assign({}, defaultParameters_1.default.groups[0], group, { pk: index })); }) })); };
var createPath = function (parameters) { return ({
    parameters: parameters
}); };
exports.default = (function (parameters) {
    return pipeable_1.pipe(setDefaultParams(parameters), createPath);
});
