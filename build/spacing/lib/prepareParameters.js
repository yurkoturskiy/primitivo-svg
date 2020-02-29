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
var validateKeySplinesFormat = function (params) {
    if (params.keySplines.length !== 4)
        throw "Wrong keySplines format";
    return params;
};
var initKeySplinesArray = function (numOfSplines) {
    return Array(numOfSplines).fill(null, 0, numOfSplines - 1);
};
var prepareParameters = function (params) {
    params = setDefaultKeySplines(params);
    params = setDefaultKeyTimes(params);
    log.debug(" input progression", params.progression);
    log.debug("input keySplines", params.keySplines);
    log.debug("input keyTimes", params.keyTimes);
    if (typeof params.keySplines === "string") {
        params.keySplines = params.keySplines.split(",");
        validateKeySplinesFormat(params);
        var proto = Array((params.progression.length - 1) * 2);
        proto.fill(null, 0, proto.length - 1);
        proto[0] = params.keySplines[0] + ", " + params.keySplines[1];
        proto[proto.length - 1] = params.keySplines[2] + ", " + params.keySplines[3];
        params.keySplines = proto;
        log.debug("keySplines", params.keySplines);
    }
    if (typeof params.keySplines === "object" &&
        params.keySplines.length !== (params.progression.length - 1) * 2)
        throw "Amount of keySplines' array items doesn't match the number of progression's items";
    log.debug("parameters", params);
    return params;
};
exports.default = prepareParameters;
