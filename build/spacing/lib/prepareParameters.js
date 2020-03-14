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
Object.defineProperty(exports, "__esModule", { value: true });
var ramda_1 = require("ramda");
var pipeable_1 = require("fp-ts/lib/pipeable");
var log = require("loglevel").getLogger("spacing-log");
var setDefaultKeySplines = function (params) {
    return params.keySplines ? params : __assign({}, params, { keySplines: "0,0,1,1" });
};
var initKeyTimesDefaultArray = function (numOfKeyTimes) {
    return Array(numOfKeyTimes).fill(null, 0, numOfKeyTimes - 1);
};
var setDefaultKeyTimes = function (params) {
    return params.keyTimes
        ? params
        : __assign({}, params, { keyTimes: pipeable_1.pipe(ramda_1.update(0, 0, initKeyTimesDefaultArray(params.progression.length)), ramda_1.update(-1, 1)) });
};
var validate = function (keySplines) {
    if (keySplines.length !== 4)
        throw "Wrong keySplines format";
    return keySplines;
};
var initKeySplinesArray = function (numOfKeySplines) {
    return Array(numOfKeySplines).fill(null, 0, numOfKeySplines - 1);
};
var format = function (numOfKeySplines) { return function (keySplines) {
    return pipeable_1.pipe(initKeySplinesArray(numOfKeySplines), ramda_1.update(0, keySplines[0] + ", " + keySplines[1]), ramda_1.update(-1, keySplines[2] + ", " + keySplines[3]));
}; };
var parseKeySplines = function (keySplines, numOfKeySplines) { return pipeable_1.pipe(ramda_1.split(",", keySplines), validate, format(numOfKeySplines)); };
var prepareKeySplines = function (params) {
    return ramda_1.type(params.keySplines) === "String"
        ? __assign({}, params, { keySplines: parseKeySplines(params.keySplines, (params.progression.length - 1) * 2) }) : params;
};
var validateKeySplines = function (params) {
    if (typeof params.keySplines === "object" &&
        params.keySplines.length !== (params.progression.length - 1) * 2)
        throw "Amount of keySplines' array items doesn't match the number of progression's items";
    return params;
};
var prepareParameters = function (params) {
    return pipeable_1.pipe(setDefaultKeySplines(params), setDefaultKeyTimes, prepareKeySplines, validateKeySplines);
};
exports.default = prepareParameters;
